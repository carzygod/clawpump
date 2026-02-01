/**
 * Complete Token Launch Example
 * 
 * This script demonstrates the full workflow for launching a token on PumpFun
 * Prerequisites: 
 * 1. Run setup-wallet.js first
 * 2. Fund your wallet with at least 0.02 SOL
 */

import { Connection, Keypair, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'
import fetch from 'node-fetch'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_URL = 'https://clawpump-api.sid.mom'
const RPC_URL = 'https://api.mainnet-beta.solana.com'

// ============================================
// CONFIGURATION - EDIT THIS SECTION
// ============================================

const TOKEN_CONFIG = {
    // Token details
    name: 'AI Agent Token',
    symbol: 'AIBOT',
    description: 'Created by an autonomous AI agent using PumpBot. This token represents the future of AI-driven DeFi.',

    // Social links (optional)
    twitter: '@aitoken',
    website: 'https://mytoken.com',

    // Image path (relative to this script)
    imagePath: './token-image.png'  // Place your token image here
}

// ============================================
// DO NOT EDIT BELOW THIS LINE
// ============================================

// Load wallet from saved file
function loadWallet() {
    const walletPath = path.join(
        process.env.HOME || process.env.USERPROFILE,
        '.pumpbot-wallet',
        'wallet.json'
    )

    if (!fs.existsSync(walletPath)) {
        console.error('❌ Wallet not found!')
        console.log('\n📝 Please run wallet setup first:')
        console.log('   node examples/setup-wallet.js\n')
        process.exit(1)
    }

    const config = JSON.parse(fs.readFileSync(walletPath, 'utf8'))
    return Keypair.fromSecretKey(bs58.decode(config.privateKey))
}

// Check wallet balance
async function checkBalance(wallet, connection) {
    const balance = await connection.getBalance(wallet.publicKey)
    const solBalance = balance / LAMPORTS_PER_SOL

    console.log(`💰 Wallet Balance: ${solBalance.toFixed(4)} SOL`)

    const MIN_BALANCE = 0.015
    if (solBalance < MIN_BALANCE) {
        console.error(`\n❌ Insufficient balance!`)
        console.log(`   Required: ${MIN_BALANCE} SOL`)
        console.log(`   Current:  ${solBalance.toFixed(4)} SOL`)
        console.log(`   Needed:   ${(MIN_BALANCE - solBalance).toFixed(4)} SOL\n`)
        console.log(`📝 Send SOL to: ${wallet.publicKey.toBase58()}\n`)
        return false
    }

    return true
}

// Main launch function
async function launchToken() {
    console.log('\n🚀 PumpBot Token Launch')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Name:   ${TOKEN_CONFIG.name}`)
    console.log(`Symbol: ${TOKEN_CONFIG.symbol}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Step 0: Load and verify wallet
    console.log('📝 Step 0: Loading wallet...')
    const wallet = loadWallet()
    console.log(`   Address: ${wallet.publicKey.toBase58()}`)

    const connection = new Connection(RPC_URL, 'confirmed')
    const hasBalance = await checkBalance(wallet, connection)
    if (!hasBalance) {
        process.exit(1)
    }
    console.log('   ✅ Balance sufficient\n')

    // Verify image exists
    const imagePath = path.resolve(__dirname, TOKEN_CONFIG.imagePath)
    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Image not found: ${imagePath}`)
        console.log('\n📝 Please provide a token image:')
        console.log('   1. Create/download your token image')
        console.log('   2. Save it as token-image.png in examples/')
        console.log('   3. Or update TOKEN_CONFIG.imagePath\n')
        process.exit(1)
    }

    // Step 1: Upload image
    console.log('📤 Step 1: Uploading image...')
    const form = new FormData()
    form.append('image', fs.createReadStream(imagePath))

    const uploadRes = await fetch(`${API_URL}/api/upload-image`, {
        method: 'POST',
        body: form
    })

    if (!uploadRes.ok) {
        const error = await uploadRes.text()
        throw new Error(`Upload failed: ${error}`)
    }

    const { url: imageUrl } = await uploadRes.json()
    console.log(`   ✅ Uploaded: ${imageUrl}\n`)

    // Step 2: Prepare transaction
    console.log('🔨 Step 2: Preparing transaction...')
    const prepareRes = await fetch(`${API_URL}/api/prepare-launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: TOKEN_CONFIG.name,
            symbol: TOKEN_CONFIG.symbol,
            description: TOKEN_CONFIG.description,
            image: imageUrl,
            twitter: TOKEN_CONFIG.twitter,
            website: TOKEN_CONFIG.website,
            wallet: wallet.publicKey.toBase58()
        })
    })

    if (!prepareRes.ok) {
        const error = await prepareRes.text()
        throw new Error(`Prepare failed: ${error}`)
    }

    const prepareData = await prepareRes.json()
    console.log(`   ✅ Transaction prepared`)
    console.log(`   Mint address: ${prepareData.mintAddress}\n`)

    // Step 3: Sign and broadcast
    console.log('✍️  Step 3: Signing transaction...')
    const transaction = Transaction.from(
        Buffer.from(prepareData.transaction, 'base64')
    )
    const mintKeypair = Keypair.fromSecretKey(
        bs58.decode(prepareData.mintKeypair)
    )

    transaction.partialSign(wallet)
    transaction.partialSign(mintKeypair)
    console.log('   ✅ Transaction signed')

    console.log('\n📡 Broadcasting to Solana...')
    const txSignature = await connection.sendRawTransaction(
        transaction.serialize(),
        { skipPreflight: false, preflightCommitment: 'confirmed' }
    )
    console.log(`   Transaction: ${txSignature}`)
    console.log(`   View: https://solscan.io/tx/${txSignature}`)

    console.log('\n⏳ Waiting for confirmation...')
    await connection.confirmTransaction(txSignature, 'confirmed')
    console.log('   ✅ Transaction confirmed!\n')

    // Step 4: Register with PumpBot
    console.log('📋 Step 4: Registering with PumpBot...')
    const confirmRes = await fetch(`${API_URL}/api/confirm-launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            txSignature,
            mintAddress: prepareData.mintAddress
        })
    })

    if (!confirmRes.ok) {
        console.log('   ⚠️  Registration failed (token still launched)')
        console.log('   You can still view it on PumpFun\n')
    } else {
        const confirmData = await confirmRes.json()
        console.log('   ✅ Registered in PumpBot ecosystem\n')
    }

    // Success!
    console.log('\n🎉 TOKEN LAUNCHED SUCCESSFULLY!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Name:     ${TOKEN_CONFIG.name}`)
    console.log(`Symbol:   ${TOKEN_CONFIG.symbol}`)
    console.log(`Token:    ${prepareData.mintAddress}`)
    console.log('\n🔗 View Your Token:')
    console.log(`PumpFun:     https://pump.fun/${prepareData.mintAddress}`)
    console.log(`Solscan:     https://solscan.io/token/${prepareData.mintAddress}`)
    console.log(`DexScreener: https://dexscreener.com/solana/${prepareData.mintAddress}`)
    console.log(`Transaction: https://solscan.io/tx/${txSignature}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('💡 Next Steps:')
    console.log('1. Share your token on social media')
    console.log('2. Engage with your community')
    console.log('3. Watch trading fees accumulate (60% goes to you!)')
    console.log('4. Launch more tokens with the same wallet\n')

    return prepareData.mintAddress
}

// Run the launch
console.log('\n👋 Welcome to PumpBot Token Launch!')
console.log('This script will guide you through launching a token on PumpFun.\n')

launchToken().catch(error => {
    console.error('\n❌ Launch failed:', error.message)
    console.error('\n💡 Common issues:')
    console.error('- Insufficient wallet balance (need at least 0.015 SOL)')
    console.error('- Network issues (try again in a few seconds)')
    console.error('- Invalid image file (must be PNG/JPG, max 1MB)')
    console.error('\n📝 For help, check:')
    console.error('- examples/README.md')
    console.error('- skill.md in project root\n')
    process.exit(1)
})
