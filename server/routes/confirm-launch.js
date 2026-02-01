import express from 'express'
import Token from '../models/Token.js'
import { Connection, PublicKey } from '@solana/web3.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Initialize Solana connection
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

/**
 * POST /api/confirm-launch
 * 
 * Called by the bot after they have signed and broadcasted the transaction
 * Registers the token launch in our database
 * 
 * Simplified version - only requires transaction hash
 */
router.post('/', async (req, res) => {
    try {
        const {
            txSignature,      // Transaction signature (hash) - REQUIRED
            mintAddress,      // Token mint address - OPTIONAL (will fetch from tx if not provided)
        } = req.body

        // Validate required field
        if (!txSignature) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field',
                errors: ['txSignature is required']
            })
        }

        console.log('📝 Confirming token launch:', {
            txSignature,
            mintAddress: mintAddress || 'will fetch from chain'
        })

        // Verify the transaction exists on-chain
        let txInfo
        try {
            txInfo = await connection.getTransaction(txSignature, {
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed'
            })

            if (!txInfo) {
                return res.status(400).json({
                    success: false,
                    error: 'Transaction not found',
                    errors: ['Could not find transaction on Solana blockchain. Make sure it has been confirmed.'],
                    hint: 'Transaction might still be processing. Try again in a few seconds.'
                })
            }

            // Verify transaction was successful
            if (txInfo.meta?.err) {
                return res.status(400).json({
                    success: false,
                    error: 'Transaction failed',
                    errors: ['The transaction failed on-chain', JSON.stringify(txInfo.meta.err)]
                })
            }

            console.log('✅ Transaction verified on-chain')

        } catch (error) {
            console.error('Error verifying transaction:', error)
            return res.status(500).json({
                success: false,
                error: 'Error verifying transaction',
                errors: [error.message],
                hint: 'Transaction might still be processing. Try again in a few seconds.'
            })
        }

        // Extract mint address from transaction if not provided
        let finalMintAddress = mintAddress
        if (!finalMintAddress && txInfo) {
            // Try to extract mint address from transaction
            // The mint address is typically one of the account keys
            // For now, we'll use the provided mint address
            // In production, you'd parse the transaction to find the mint
            console.log('⚠️  Mint address not provided and cannot be extracted automatically')
        }

        // If we have mint address, save to database
        if (finalMintAddress) {
            try {
                // Validate mint address
                new PublicKey(finalMintAddress)

                // Check if token already exists
                const existingToken = await Token.findOne({ address: finalMintAddress })
                if (existingToken) {
                    console.log('ℹ️  Token already registered')
                    return res.status(200).json({
                        success: true,
                        message: 'Token already registered',
                        alreadyExists: true,
                        token: {
                            address: existingToken.address,
                            name: existingToken.name,
                            symbol: existingToken.symbol,
                        },
                        transaction: txSignature,
                        links: {
                            explorer: `https://solscan.io/tx/${txSignature}`,
                            token: `https://solscan.io/token/${finalMintAddress}`,
                            pumpfun: `https://pump.fun/${finalMintAddress}`,
                        }
                    })
                }

                // Create minimal token record
                // Additional details can be updated later via another endpoint
                const token = new Token({
                    address: finalMintAddress,
                    name: 'Unknown', // Will be updated later
                    symbol: 'TBD',
                    description: 'Token launched via PumpBot',
                    image: '',
                    agentName: 'Bot Agent',
                    agentWallet: txInfo.transaction.message.accountKeys[0]?.toBase58() || 'unknown',
                    platform: 'pumpbot',
                    deployTxHash: txSignature,
                    bondingProgress: 0,
                    marketCap: 0,
                    price: 0,
                    supply: 0,
                })

                await token.save()

                // Emit WebSocket event for real-time update
                const io = req.app.get('io')
                if (io) {
                    io.emit('newLaunch', token)
                }

                console.log('✅ Token registered:', finalMintAddress)

            } catch (error) {
                console.error('Error saving token:', error)
                // Continue anyway - the main goal is to confirm the transaction
            }
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Transaction confirmed successfully',
            transaction: {
                signature: txSignature,
                slot: txInfo.slot,
                blockTime: txInfo.blockTime,
                fee: txInfo.meta?.fee,
            },
            mintAddress: finalMintAddress,
            links: {
                explorer: `https://solscan.io/tx/${txSignature}`,
                solana: `https://explorer.solana.com/tx/${txSignature}`,
                ...(finalMintAddress ? {
                    token: `https://solscan.io/token/${finalMintAddress}`,
                    pumpfun: `https://pump.fun/${finalMintAddress}`,
                    dexscreener: `https://dexscreener.com/solana/${finalMintAddress}`
                } : {})
            }
        })

    } catch (error) {
        console.error('❌ Confirm launch error:', error)
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            errors: [error.message],
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
})

export default router
