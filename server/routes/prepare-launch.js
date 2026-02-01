import express from 'express'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { OnlinePumpSdk, PUMP_SDK } from '@pump-fun/pump-sdk'
import bs58 from 'bs58'
import BN from 'bn.js'
import dotenv from 'dotenv'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Solana connection
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

/**
 * POST /api/prepare-launch
 * 
 * Creates an unsigned transaction for token creation on pump.fun
 * Bot will sign and broadcast this transaction themselves
 * 
 * Expected request body:
 * {
 *   name: string,
 *   symbol: string,
 *   description: string,
 *   image: string (full URL to image, use /api/upload-image to upload),
 *   website?: string,
 *   twitter?: string,
 *   wallet: string (bot's public key)
 * }
 */
router.post('/', async (req, res) => {
    try {
        const {
            name,
            symbol,
            description,
            image,
            website,
            twitter,
            wallet, // Bot's public key (as string)
        } = req.body

        // Validate required fields
        if (!name || !symbol || !description || !image || !wallet) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                errors: ['name, symbol, description, image, and wallet are required'],
                hint: 'Use POST /api/upload-image to upload the token image first'
            })
        }

        // Validate wallet address
        let creatorPubkey
        try {
            creatorPubkey = new PublicKey(wallet)
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address',
                errors: ['wallet must be a valid Solana public key']
            })
        }

        // Initialize PumpFun SDK
        const sdk = new OnlinePumpSdk(connection)

        // Create the token mint keypair (this will be the token's address)
        const mintKeypair = Keypair.generate()

        console.log('🚀 Preparing PumpFun token launch:', {
            name,
            symbol,
            creator: wallet,
            mint: mintKeypair.publicKey.toBase58()
        })

        // Create metadata JSON
        const metadata = {
            name,
            symbol,
            description,
            image, // URL to uploaded image
            showName: true
        }

        if (twitter) metadata.twitter = twitter
        if (website) metadata.website = website

        // Store metadata locally and serve via HTTP
        const metadataDir = path.join(process.cwd(), 'public', 'metadata')
        if (!fs.existsSync(metadataDir)) {
            fs.mkdirSync(metadataDir, { recursive: true })
        }

        const metadataId = crypto.randomBytes(16).toString('hex')
        const metadataFilename = `${metadataId}.json`
        const metadataPath = path.join(metadataDir, metadataFilename)

        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

        const protocol = req.protocol
        const host = req.get('host')
        const baseUrl = process.env.SERVER_URL || `${protocol}://${host}`
        const metadataUri = `${baseUrl}/metadata/${metadataFilename}`

        console.log('📄 Metadata stored:', metadataUri)

        // Get global state
        const global = await sdk.fetchGlobal()

        // Create instruction set for creating token
        // Note: Using PUMP_SDK (offline SDK) to generate instructions
        const offlineSdk = PUMP_SDK

        const instructions = await offlineSdk.createV2AndBuyInstructions({
            global,
            mint: mintKeypair.publicKey,
            name,
            symbol,
            uri: metadataUri,
            creator: creatorPubkey,
            user: creatorPubkey, // Same as creator
            // PumpFun requires a minimum buy amount - cannot be 0
            // Using 0.001 SOL as minimum initial purchase
            amount: new BN(1000000), // Amount of tokens to buy (will be calculated by bonding curve)
            solAmount: new BN(1000000), // 0.001 SOL in lamports (1 SOL = 1,000,000,000 lamports)
            mayhemMode: false
        })

        // Build transaction
        const transaction = new Transaction()
        const { blockhash } = await connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = blockhash
        transaction.feePayer = creatorPubkey

        // Add all instructions
        instructions.forEach(ix => transaction.add(ix))

        // Serialize the transaction (unsigned)
        const serializedTx = transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false
        })

        console.log('✅ Transaction prepared successfully')

        // Return the unsigned transaction and mint keypair
        res.status(200).json({
            success: true,
            message: 'Transaction prepared. Sign with your wallet + mint keypair, then broadcast',
            transaction: serializedTx.toString('base64'),
            mintKeypair: bs58.encode(mintKeypair.secretKey),
            mintAddress: mintKeypair.publicKey.toBase58(),
            metadataUri,
            creator: wallet,
            token: {
                name,
                symbol,
                description,
                image,
                website,
                twitter
            },
            instructions: {
                step1: 'Decode the transaction from base64: Transaction.from(Buffer.from(transaction, "base64"))',
                step2: 'Decode the mintKeypair from base58: Keypair.fromSecretKey(bs58.decode(mintKeypair))',
                step3: 'Sign the transaction with BOTH wallet and mint keypair',
                step4: '  transaction.partialSign(walletKeypair)',
                step5: '  transaction.partialSign(mintKeypair)',
                step6: 'Serialize: const signed = transaction.serialize()',
                step7: 'Broadcast: const sig = await connection.sendRawTransaction(signed)',
                step8: 'Confirm: await connection.confirmTransaction(sig)',
                step9: 'Call POST /api/confirm-launch with { signature: sig, mintAddress }'
            }
        })

    } catch (error) {
        console.error('❌ Prepare launch error:', error)
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            errors: [error.message],
            details: error.toString(),
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
})

export default router
