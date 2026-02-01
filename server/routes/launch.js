import express from 'express'
import Token from '../models/Token.js'
import { fetchMoltbookPost, extractTokenData, validateTokenData } from '../utils/moltbook.js'
import { createPumpFunToken, getBondingCurveProgress } from '../utils/pumpfun.js'

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { moltbook_key, post_id } = req.body

        // Validate request
        if (!moltbook_key || !post_id) {
            return res.status(400).json({
                error: 'Missing required fields',
                errors: ['moltbook_key and post_id are required']
            })
        }

        // Fetch Moltbook post
        const post = await fetchMoltbookPost(post_id, moltbook_key)
        if (!post) {
            return res.status(404).json({
                error: 'Post not found',
                errors: ['Could not fetch Moltbook post with provided ID']
            })
        }

        // Extract token data from post
        const tokenData = extractTokenData(post.content)
        if (!tokenData) {
            return res.status(400).json({
                error: 'Invalid post format',
                errors: [
                    'Post must contain !pumpbot tag',
                    'Token data must be in JSON format inside code block (```json)',
                    'See documentation at /skill.md'
                ]
            })
        }

        // Validate token data
        const validation = validateTokenData(tokenData)
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Invalid token data',
                errors: validation.errors
            })
        }

        // Check if token already exists from this post
        const existingToken = await Token.findOne({ postId: post_id })
        if (existingToken) {
            return res.status(409).json({
                error: 'Token already launched',
                errors: ['A token has already been launched from this post'],
                token_address: existingToken.address
            })
        }

        // Create token on PumpFun
        const pumpfunResult = await createPumpFunToken(tokenData)
        if (!pumpfunResult.success) {
            return res.status(500).json({
                error: 'Token deployment failed',
                errors: [pumpfunResult.error]
            })
        }

        // Save token to database
        const token = new Token({
            address: pumpfunResult.tokenAddress,
            name: tokenData.name,
            symbol: tokenData.symbol,
            description: tokenData.description,
            image: tokenData.image,
            website: tokenData.website,
            twitter: tokenData.twitter,
            agentName: post.author?.name || 'Unknown Agent',
            agentWallet: tokenData.wallet,
            postId: post_id,
            postUrl: `https://www.moltbook.com/post/${post_id}`,
            platform: 'moltbook',
            bondingCurveAddress: pumpfunResult.bondingCurveAddress,
            deployTxHash: pumpfunResult.txHash
        })

        await token.save()

        // Emit WebSocket event for real-time update
        const io = req.app.get('io')
        if (io) {
            io.emit('newLaunch', token)
        }

        // Return success response
        res.status(201).json({
            success: true,
            agent: token.agentName,
            post_id,
            post_url: token.postUrl,
            token_address: token.address,
            tx_hash: token.deployTxHash,
            bonding_curve_address: token.bondingCurveAddress,
            dexscreener_url: `https://dexscreener.com/solana/${token.address}`,
            explorer_url: `https://solscan.io/token/${token.address}`,
            rewards: {
                agent_share: '60%',
                liquidity_share: '30%',
                platform_share: '10%',
                agent_wallet: token.agentWallet
            }
        })

    } catch (error) {
        console.error('Launch error:', error)
        res.status(500).json({
            error: 'Internal server error',
            errors: [error.message]
        })
    }
})

export default router
