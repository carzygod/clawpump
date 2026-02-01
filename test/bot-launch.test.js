/**
 * PumpBot Integration Test - Bot Token Launch
 * 
 * This test simulates a complete bot workflow for launching a token:
 * 1. Load bot's Solana wallet from private key
 * 2. Request unsigned transaction from /api/prepare-launch
 * 3. Sign transaction with bot's wallet + mint keypair
 * 4. Broadcast signed transaction to Solana
 * 5. Confirm launch with /api/confirm-launch
 * 
 * SETUP INSTRUCTIONS:
 * 1. Replace YOUR_PRIVATE_KEY_HERE with your actual Solana private key (base58)
 * 2. Ensure you have at least 0.1 SOL in the wallet for transaction fees
 * 3. Start the PumpBot server: npm run server:dev
 * 4. Run this test: node test/bot-launch.test.js
 */

// ===========================
// CONFIGURATION - EDIT THIS
// ===========================

const CONFIG = {
    // IMPORTANT: DO NOT commit real private keys!
    // Set your private key via environment variable:
    // export WALLET_PRIVATE_KEY="your_key_here"
    // Or use the wallet created by: node examples/setup-wallet.js
    PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE",

    // PumpBot API endpoint
    API_URL: "https://clawpump-api.sid.mom",

    // Solana RPC endpoint
    SOLANA_RPC: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
    // For testing on devnet, use: "https://api.devnet.solana.com"

    // Token metadata
    TOKEN: {
        name: "Test Bot Token",
        symbol: "TBOT",
        description: "This is a test token launched by an AI bot using PumpBot",
        image: "https://via.placeholder.com/400/14F195/ffffff?text=TBOT"
    }
}

// ===========================
// DEPENDENCIES
// ===========================

import { Connection, Keypair, Transaction } from '@solana/web3.js'
import bs58 from 'bs58'
import fetch from 'node-fetch'

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Load wallet from private key
 */
function loadWallet(privateKey) {
    console.log('📝 Loading wallet from private key...')

    if (privateKey === "YOUR_PRIVATE_KEY_HERE") {
        throw new Error('❌ Please set your PRIVATE_KEY in CONFIG section!')
    }

    try {
        const secretKey = bs58.decode(privateKey)
        const wallet = Keypair.fromSecretKey(secretKey)
        console.log('✅ Wallet loaded:', wallet.publicKey.toBase58())
        return wallet
    } catch (error) {
        throw new Error(`Failed to load wallet: ${error.message}`)
    }
}

/**
 * Check wallet balance
 */
async function checkBalance(connection, wallet) {
    console.log('\n💰 Checking wallet balance...')
    const balance = await connection.getBalance(wallet.publicKey)
    const solBalance = balance / 1e9
    console.log(`   Balance: ${solBalance} SOL`)

    if (solBalance < 0.05) {
        throw new Error('❌ Insufficient balance! Need at least 0.05 SOL for transaction fees.')
    }

    return solBalance
}

/**
 * Step 1: Request unsigned transaction from PumpBot
 */
async function prepareTransaction(wallet, tokenMetadata) {
    console.log('\n🔨 Step 1: Requesting unsigned transaction from PumpBot...')

    const response = await fetch(`${CONFIG.API_URL}/api/prepare-launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            description: tokenMetadata.description,
            image: tokenMetadata.image,
            wallet: wallet.publicKey.toBase58()
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`API Error (${response.status}): ${error}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error(`Prepare launch failed: ${data.error || 'Unknown error'}`)
    }

    console.log('✅ Unsigned transaction received')
    console.log('   Mint address will be:', data.mintAddress || 'generated')

    return {
        transaction: data.transaction,
        mintKeypair: data.mintKeypair
    }
}

/**
 * Step 2: Sign and broadcast transaction
 */
async function signAndBroadcast(connection, wallet, transactionData) {
    console.log('\n✍️  Step 2: Signing transaction...')

    try {
        // Decode the unsigned transaction
        const transaction = Transaction.from(Buffer.from(transactionData.transaction, 'base64'))

        // Decode the mint keypair
        const mint = Keypair.fromSecretKey(bs58.decode(transactionData.mintKeypair))
        console.log('   Token mint address:', mint.publicKey.toBase58())

        // Sign with both wallet and mint keypair
        transaction.partialSign(wallet)
        transaction.partialSign(mint)
        console.log('✅ Transaction signed')

        // Broadcast to Solana
        console.log('\n📡 Step 3: Broadcasting to Solana...')
        const signature = await connection.sendRawTransaction(transaction.serialize())
        console.log('   Transaction signature:', signature)

        // Wait for confirmation
        console.log('⏳ Waiting for confirmation...')
        await connection.confirmTransaction(signature, 'confirmed')
        console.log('✅ Transaction confirmed on Solana!')

        return {
            signature,
            mint: mint.publicKey.toBase58()
        }
    } catch (error) {
        throw new Error(`Transaction failed: ${error.message}`)
    }
}

/**
 * Step 3: Confirm launch with PumpBot
 */
async function confirmLaunch(wallet, txData) {
    console.log('\n📋 Step 4: Confirming launch with PumpBot...')

    const response = await fetch(`${CONFIG.API_URL}/api/confirm-launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            txSignature: txData.signature,
            mintAddress: txData.mint
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Confirm API Error (${response.status}): ${error}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error(`Confirm failed: ${data.error || 'Unknown error'}`)
    }

    console.log('✅ Launch confirmed and registered!')
    return data.token
}

/**
 * Display final results
 */
function displayResults(token, txData) {
    console.log('\n' + '='.repeat(60))
    console.log('🎉 TOKEN LAUNCHED SUCCESSFULLY!')
    console.log('='.repeat(60))
    console.log(`
Token Details:
  Address:     ${txData.mint}
  Transaction: ${txData.signature}
  
Links:
  PumpFun:     https://pump.fun/${txData.mint}
  Solscan:     https://solscan.io/token/${txData.mint}
  Explorer:    https://solscan.io/tx/${txData.signature}
  
Status:
  ✅ Transaction confirmed on Solana
  ✅ Registered in PumpBot ecosystem
`)
    console.log('='.repeat(60))
}

// ===========================
// MAIN TEST FUNCTION
// ===========================

async function runBotLaunchTest() {
    console.log('🤖 PumpBot Integration Test - Bot Token Launch')
    console.log('='.repeat(60))

    try {
        // Initialize
        const wallet = loadWallet(CONFIG.PRIVATE_KEY)
        const connection = new Connection(CONFIG.SOLANA_RPC, 'confirmed')

        // Check balance
        await checkBalance(connection, wallet)

        // Step 1: Prepare transaction
        const transactionData = await prepareTransaction(wallet, CONFIG.TOKEN)

        // Step 2 & 3: Sign and broadcast
        const txData = await signAndBroadcast(connection, wallet, transactionData)

        // Add small delay to ensure blockchain state is updated
        console.log('\n⏳ Waiting for blockchain state to update...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Step 4: Confirm with PumpBot
        const token = await confirmLaunch(wallet, txData)

        // Display results
        displayResults(token, txData)

        console.log('\n✅ TEST PASSED - All steps completed successfully!')
        process.exit(0)

    } catch (error) {
        console.error('\n❌ TEST FAILED')
        console.error('Error:', error.message)
        console.error('\nFull error:', error)
        process.exit(1)
    }
}

// ===========================
// RUN TEST
// ===========================

// Run test immediately when file is executed
runBotLaunchTest()

// Export for potential use in other test files
export { runBotLaunchTest }
