/**
 * PumpBot Agent Wallet Setup
 * 
 * This script helps AI agents create and manage their own Solana wallet
 * Run this BEFORE attempting to launch tokens
 */

import { Keypair, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function setupAgentWallet() {
    console.log('🤖 PumpBot Agent Wallet Setup')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const walletDir = path.join(process.env.HOME || process.env.USERPROFILE, '.pumpbot-wallet')
    const walletPath = path.join(walletDir, 'wallet.json')

    // Check if wallet already exists
    if (fs.existsSync(walletPath)) {
        console.log('ℹ️  Wallet already exists!')
        const config = JSON.parse(fs.readFileSync(walletPath, 'utf8'))
        console.log(`📍 Address: ${config.publicKey}`)
        console.log(`📅 Created: ${config.createdAt}\n`)

        // Load and check balance
        const wallet = Keypair.fromSecretKey(bs58.decode(config.privateKey))
        const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')

        console.log('💰 Checking balance...')
        const balance = await connection.getBalance(wallet.publicKey)
        const solBalance = balance / LAMPORTS_PER_SOL

        console.log(`   Current Balance: ${solBalance.toFixed(4)} SOL\n`)

        const MIN_BALANCE = 0.015
        if (solBalance < MIN_BALANCE) {
            console.log('⚠️  LOW BALANCE ALERT!')
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log(`Minimum required: ${MIN_BALANCE} SOL`)
            console.log(`You currently have: ${solBalance.toFixed(4)} SOL`)
            console.log(`You need: ${(MIN_BALANCE - solBalance).toFixed(4)} SOL more\n`)

            console.log('📝 How to fund your wallet:')
            console.log(`1. Copy this address: ${wallet.publicKey.toBase58()}`)
            console.log('2. Send SOL from:')
            console.log('   - Coinbase, Binance, Kraken, etc.')
            console.log('   - Phantom wallet')
            console.log('   - Any Solana wallet\n')
            console.log('3. Recommended amount: 0.05 SOL (for multiple launches)')
            console.log('4. Wait ~30 seconds for confirmation')
            console.log('5. Run this script again to verify\n')

            console.log('💡 Quick transfer command (if you have solana CLI):')
            console.log(`   solana transfer ${wallet.publicKey.toBase58()} 0.05`)
        } else {
            console.log('✅ WALLET IS READY!')
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log('Your wallet has sufficient balance to launch tokens.')
            console.log('\n🚀 Next steps:')
            console.log('1. Prepare your token image (PNG/JPG, max 1MB)')
            console.log('2. Edit examples/launch-token.js with your token info')
            console.log('3. Run: node examples/launch-token.js\n')
        }
        return
    }

    // Create new wallet
    console.log('📝 No wallet found. Creating new wallet...\n')
    const wallet = Keypair.generate()

    // Create secure directory
    if (!fs.existsSync(walletDir)) {
        fs.mkdirSync(walletDir, { mode: 0o700, recursive: true })
    }

    // Save wallet
    const config = {
        publicKey: wallet.publicKey.toBase58(),
        privateKey: bs58.encode(wallet.secretKey),
        createdAt: new Date().toISOString(),
        network: 'mainnet-beta',
        note: 'This is your AI agent wallet for PumpBot. Keep it secure!'
    }

    fs.writeFileSync(walletPath, JSON.stringify(config, null, 2), { mode: 0o600 })

    console.log('🎉 NEW WALLET CREATED!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📁 Location: ${walletPath}`)
    console.log(`📍 Address:  ${config.publicKey}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('⚠️  IMPORTANT: SECURITY REMINDERS')
    console.log('1. ��� NEVER share your private key with anyone')
    console.log('2. 💾 Backup this wallet file to a secure location')
    console.log('3. 🔐 The wallet file is saved with restricted permissions')
    console.log('4. 📋 Keep a copy of your public address somewhere safe\n')

    console.log('📝 NEXT STEPS:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('1. 💰 Fund this wallet with SOL')
    console.log(`   Address: ${config.publicKey}`)
    console.log('   Recommended: 0.05 SOL (enough for multiple token launches)\n')

    console.log('2. ⏳ Wait for the transaction to confirm (~30 seconds)\n')

    console.log('3. ✅ Run this script again to verify balance:')
    console.log('   node examples/setup-wallet.js\n')

    console.log('4. 🚀 Once funded, you can launch tokens!')
    console.log('   node examples/launch-token.js\n')

    console.log('💡 TIP: Save this address for future reference!')
    console.log(`   echo "${config.publicKey}" > my-wallet-address.txt`)
}

// Run setup
setupAgentWallet().catch(error => {
    console.error('\n❌ Error:', error.message)
    console.error('\nIf you need help, check:')
    console.error('- README.md in this project')
    console.error('- skill.md for detailed instructions')
    process.exit(1)
})
