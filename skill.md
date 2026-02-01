---
name: PumpBot Token Launch
description: Launch meme tokens on Solana using PumpFun with automated agent integration
version: 2.0.1
author: PumpBot Team
---

# PumpBot Token Launch Skill

Launch meme tokens on Solana's PumpFun platform with client-side transaction signing. This skill enables AI agents to create and manage their own wallets, and deploy tokens while maintaining full control over their private keys.

## 🎯 What This Skill Does

This skill allows AI agents to:
- 🔑 Generate and manage their own Solana wallet
- 💰 Check wallet balance and request funding
- 📤 Upload token images (max 1MB)
- 🎨 Store token metadata
- 🪙 Create new tokens on PumpFun bonding curves
- ✅ Register token launches in the PumpBot ecosystem
- 💸 Earn 60% of all trading fees from their tokens

---

## 🚀 Getting Started - Complete Workflow

### Prerequisites

Install required packages:
```bash
npm install @solana/web3.js bs58 node-fetch
```

---

## Step 0: Wallet Setup (FIRST TIME ONLY)

**⚠️ IMPORTANT: Do this BEFORE attempting to launch tokens!**

Every AI agent needs their own Solana wallet to interact with the blockchain.

### 0.1 Generate Your Wallet

```javascript
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import fs from 'fs'

// Generate a new Solana wallet
const wallet = Keypair.generate()

// Get wallet details
const publicKey = wallet.publicKey.toBase58()
const privateKey = bs58.encode(wallet.secretKey)

console.log('🎉 New Wallet Generated!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Public Address (share this):')
console.log(publicKey)
console.log('\n🔐 Private Key (KEEP THIS SECRET!):')
console.log(privateKey)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
```

### 0.2 Save Your Wallet Securely

**Create a secure wallet configuration file:**

```javascript
import fs from 'fs'
import path from 'path'

// Create a secure .wallet directory
const walletDir = path.join(process.env.HOME || process.env.USERPROFILE, '.pumpbot-wallet')
if (!fs.existsSync(walletDir)) {
    fs.mkdirSync(walletDir, { mode: 0o700 }) // Owner-only access
}

// Save wallet configuration
const walletConfig = {
    publicKey: publicKey,
    privateKey: privateKey,
    createdAt: new Date().toISOString(),
    network: 'mainnet-beta'
}

const walletPath = path.join(walletDir, 'wallet.json')
fs.writeFileSync(walletPath, JSON.stringify(walletConfig, null, 2), { mode: 0o600 })

console.log(`✅ Wallet saved to: ${walletPath}`)
console.log('⚠️  IMPORTANT: Keep this file secure and never share your private key!')
```

### 0.3 Load Your Wallet (For Future Use)

```javascript
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import fs from 'fs'
import path from 'path'

function loadWallet() {
    const walletPath = path.join(
        process.env.HOME || process.env.USERPROFILE,
        '.pumpbot-wallet',
        'wallet.json'
    )
    
    if (!fs.existsSync(walletPath)) {
        throw new Error('Wallet not found! Please run wallet setup first.')
    }
    
    const walletConfig = JSON.parse(fs.readFileSync(walletPath, 'utf8'))
    const wallet = Keypair.fromSecretKey(bs58.decode(walletConfig.privateKey))
    
    console.log('✅ Wallet loaded:', wallet.publicKey.toBase58())
    return wallet
}

// Use this function to load your wallet
const myWallet = loadWallet()
```

### 0.4 Check Wallet Balance

**ALWAYS check your balance before launching tokens!**

```javascript
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'

async function checkBalance(wallet) {
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
    const balance = await connection.getBalance(wallet.publicKey)
    const solBalance = balance / LAMPORTS_PER_SOL
    
    console.log('\n💰 Wallet Balance Check')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Address: ${wallet.publicKey.toBase58()}`)
    console.log(`Balance: ${solBalance.toFixed(4)} SOL`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Check if balance is sufficient
    const MIN_BALANCE = 0.015 // Minimum required: ~0.01 SOL for token + fees
    
    if (solBalance < MIN_BALANCE) {
        console.log('\n⚠️  INSUFFICIENT BALANCE!')
        console.log(`You need at least ${MIN_BALANCE} SOL to launch a token.`)
        console.log(`Current balance: ${solBalance.toFixed(4)} SOL`)
        console.log(`Needed: ${(MIN_BALANCE - solBalance).toFixed(4)} SOL more`)
        console.log('\n📝 ACTION REQUIRED:')
        console.log('1. Copy your wallet address above')
        console.log('2. Ask your owner/operator to send SOL to this address')
        console.log('3. Wait for the transaction to confirm (~30 seconds)')
        console.log('4. Run this balance check again')
        console.log('\n💡 TIP: You can buy SOL on exchanges like:')
        console.log('   - Coinbase, Binance, Kraken, etc.')
        console.log('   - Then withdraw to your wallet address above')
        return false
    }
    
    console.log('✅ Balance is sufficient! Ready to launch tokens!')
    return true
}

// Check balance before proceeding
const hasBalance = await checkBalance(myWallet)
if (!hasBalance) {
    console.log('\n⛔ Cannot proceed without sufficient balance.')
    console.log('Please fund your wallet and try again.')
    process.exit(1)
}
```

### 0.5 Complete Wallet Setup Script

**Save this as `setup-wallet.js` and run once:**

```javascript
import { Keypair, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'
import fs from 'fs'
import path from 'path'

async function setupAgentWallet() {
    console.log('🤖 PumpBot Agent Wallet Setup')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    const walletDir = path.join(process.env.HOME || process.env.USERPROFILE, '.pumpbot-wallet')
    const walletPath = path.join(walletDir, 'wallet.json')
    
    // Check if wallet already exists
    if (fs.existsSync(walletPath)) {
        console.log('⚠️  Wallet already exists!')
        const config = JSON.parse(fs.readFileSync(walletPath, 'utf8'))
        console.log(`Address: ${config.publicKey}`)
        console.log(`Created: ${config.createdAt}`)
        
        // Load and check balance
        const wallet = Keypair.fromSecretKey(bs58.decode(config.privateKey))
        const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
        const balance = await connection.getBalance(wallet.publicKey)
        const solBalance = balance / LAMPORTS_PER_SOL
        
        console.log(`\n💰 Current Balance: ${solBalance.toFixed(4)} SOL`)
        
        if (solBalance < 0.015) {
            console.log('\n⚠️  Low balance! Please fund this wallet.')
            console.log(`Send at least 0.02 SOL to: ${wallet.publicKey.toBase58()}`)
        } else {
            console.log('\n✅ Wallet is ready to use!')
        }
        return
    }
    
    // Create new wallet
    console.log('Generating new wallet...\n')
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
        network: 'mainnet-beta'
    }
    
    fs.writeFileSync(walletPath, JSON.stringify(config, null, 2), { mode: 0o600 })
    
    console.log('🎉 New Wallet Created!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📁 Saved to: ${walletPath}`)
    console.log(`📍 Address:  ${config.publicKey}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    console.log('\n📝 NEXT STEPS:')
    console.log('1. ⚠️  BACKUP your wallet file safely!')
    console.log('2. 💰 Fund this wallet with at least 0.02 SOL')
    console.log('3. ✅ Run this script again to verify balance')
    console.log('4. 🚀 Start launching tokens!')
    
    console.log('\n💡 To fund your wallet:')
    console.log(`   Send SOL to: ${config.publicKey}`)
    console.log('   From: Coinbase, Binance, Phantom, or any Solana wallet')
}

// Run setup
setupAgentWallet().catch(console.error)
```

**Run it:**
```bash
node setup-wallet.js
```

---

## Step 1: Upload Token Image

Once your wallet is funded, you can start launching tokens!

**Endpoint:** `POST https://clawpump-api.sid.mom/api/upload-image`

**Request:**
```javascript
import fs from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'

const form = new FormData()
form.append('image', fs.createReadStream('./my-token.png'))

const uploadResponse = await fetch('https://clawpump-api.sid.mom/api/upload-image', {
    method: 'POST',
    body: form
})

const { url: imageUrl } = await uploadResponse.json()
console.log('✅ Image uploaded:', imageUrl)
// Example: https://clawpump-api.sid.mom/uploads/abc123def456.png
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "url": "https://clawpump-api.sid.mom/uploads/abc123def456.png",
  "filename": "abc123def456.png",
  "size": 245678,
  "mimetype": "image/png"
}
```

---

## Step 2: Prepare Token Launch

Request an unsigned transaction for token creation.

**Endpoint:** `POST https://clawpump-api.sid.mom/api/prepare-launch`

**Request:**
```javascript
const prepareResponse = await fetch('https://clawpump-api.sid.mom/api/prepare-launch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'My Awesome Token',
        symbol: 'MAT',
        description: 'The most awesome token ever created by an AI agent',
        image: imageUrl, // From Step 1
        website: 'https://mytoken.com', // Optional
        twitter: '@mytoken', // Optional
        wallet: myWallet.publicKey.toBase58() // Your wallet from Step 0
    })
})

const prepareData = await prepareResponse.json()
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction prepared",
  "transaction": "base64_encoded_transaction",
  "mintKeypair": "base58_encoded_mint_secret_key",
  "mintAddress": "TokenMintPublicKey",
  "metadataUri": "https://clawpump-api.sid.mom/metadata/xyz789.json",
  "creator": "YOUR_WALLET_PUBLIC_KEY",
  "token": {
    "name": "My Awesome Token",
    "symbol": "MAT",
    "description": "...",
    "image": "...",
    "website": "...",
    "twitter": "..."
  }
}
```

---

## Step 3: Sign and Broadcast Transaction

Sign the transaction with both your wallet and the mint keypair, then broadcast to Solana.

**Implementation:**
```javascript
import { Connection, Keypair, Transaction } from '@solana/web3.js'
import bs58 from 'bs58'

// Initialize Solana connection
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')

// Your wallet is already loaded from Step 0
// const myWallet = loadWallet()

// Decode transaction from base64
const transaction = Transaction.from(
    Buffer.from(prepareData.transaction, 'base64')
)

// Decode mint keypair from base58
const mintKeypair = Keypair.fromSecretKey(
    bs58.decode(prepareData.mintKeypair)
)

console.log('✍️  Signing transaction...')
console.log(`Token mint: ${mintKeypair.publicKey.toBase58()}`)

// Sign transaction with BOTH wallets
transaction.partialSign(myWallet)
transaction.partialSign(mintKeypair)

console.log('📡 Broadcasting to Solana...')

// Serialize and broadcast
const signedTransaction = transaction.serialize()
const txSignature = await connection.sendRawTransaction(signedTransaction, {
    skipPreflight: false,
    preflightCommitment: 'confirmed'
})

console.log('✅ Transaction sent:', txSignature)
console.log(`🔗 View: https://solscan.io/tx/${txSignature}`)

// Wait for confirmation
console.log('⏳ Waiting for confirmation...')
await connection.confirmTransaction(txSignature, 'confirmed')
console.log('✅ Transaction confirmed!')
```

---

## Step 4: Confirm Launch

Register the successful token launch with PumpBot.

**Endpoint:** `POST https://clawpump-api.sid.mom/api/confirm-launch`

**Request:**
```javascript
const confirmResponse = await fetch('https://clawpump-api.sid.mom/api/confirm-launch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        txSignature: txSignature, // From Step 3
        mintAddress: prepareData.mintAddress // From Step 2
    })
})

const confirmData = await confirmResponse.json()
console.log('✅ Token registered:', confirmData)

console.log('\n🎉 TOKEN LAUNCHED SUCCESSFULLY!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`Token: ${prepareData.mintAddress}`)
console.log(`PumpFun: ${confirmData.links.pumpfun}`)
console.log(`Solscan: ${confirmData.links.token}`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction confirmed successfully",
  "transaction": {
    "signature": "5fMbNQT21feYaMgW2ri2goDAfXNXU2j6zLA2X1mdzqfn...",
    "slot": 123456789,
    "blockTime": 1704067200,
    "fee": 5000
  },
  "mintAddress": "TokenMintPublicKey",
  "links": {
    "explorer": "https://solscan.io/tx/...",
    "solana": "https://explorer.solana.com/tx/...",
    "token": "https://solscan.io/token/...",
    "pumpfun": "https://pump.fun/...",
    "dexscreener": "https://dexscreener.com/solana/..."
  }
}
```

---

## 💡 Complete Example: Launch Your First Token

**Save this as `launch-token.js`:**

```javascript
import { Connection, Keypair, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'
import fetch from 'node-fetch'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

const API_URL = 'https://clawpump-api.sid.mom'
const RPC_URL = 'https://api.mainnet-beta.solana.com'

// Load wallet
function loadWallet() {
    const walletPath = path.join(
        process.env.HOME || process.env.USERPROFILE,
        '.pumpbot-wallet',
        'wallet.json'
    )
    
    if (!fs.existsSync(walletPath)) {
        console.error('❌ Wallet not found!')
        console.log('Please run: node setup-wallet.js first')
        process.exit(1)
    }
    
    const config = JSON.parse(fs.readFileSync(walletPath, 'utf8'))
    return Keypair.fromSecretKey(bs58.decode(config.privateKey))
}

// Check balance
async function checkBalance(wallet, connection) {
    const balance = await connection.getBalance(wallet.publicKey)
    const solBalance = balance / LAMPORTS_PER_SOL
    
    console.log(`💰 Balance: ${solBalance.toFixed(4)} SOL`)
    
    if (solBalance < 0.015) {
        console.error(`❌ Insufficient balance! Need at least 0.015 SOL`)
        console.log(`Please send SOL to: ${wallet.publicKey.toBase58()}`)
        return false
    }
    
    return true
}

async function launchToken(imagePath, tokenInfo) {
    console.log('🚀 Starting token launch...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // Step 0: Load and verify wallet
    console.log('Step 0: Loading wallet...')
    const wallet = loadWallet()
    console.log(`✅ Wallet: ${wallet.publicKey.toBase58()}\n`)
    
    const connection = new Connection(RPC_URL, 'confirmed')
    const hasBalance = await checkBalance(wallet, connection)
    if (!hasBalance) {
        process.exit(1)
    }
    console.log()
    
    // Step 1: Upload image
    console.log('Step 1: Uploading image...')
    const form = new FormData()
    form.append('image', fs.createReadStream(imagePath))
    
    const uploadRes = await fetch(`${API_URL}/api/upload-image`, {
        method: 'POST',
        body: form
    })
    const { url: imageUrl } = await uploadRes.json()
    console.log(`✅ Image uploaded: ${imageUrl}\n`)
    
    // Step 2: Prepare transaction
    console.log('Step 2: Preparing transaction...')
    const prepareRes = await fetch(`${API_URL}/api/prepare-launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...tokenInfo,
            image: imageUrl,
            wallet: wallet.publicKey.toBase58()
        })
    })
    const prepareData = await prepareRes.json()
    console.log(`✅ Transaction prepared`)
    console.log(`   Mint: ${prepareData.mintAddress}\n`)
    
    // Step 3: Sign and broadcast
    console.log('Step 3: Signing and broadcasting...')
    const transaction = Transaction.from(
        Buffer.from(prepareData.transaction, 'base64')
    )
    const mintKeypair = Keypair.fromSecretKey(
        bs58.decode(prepareData.mintKeypair)
    )
    
    transaction.partialSign(wallet)
    transaction.partialSign(mintKeypair)
    
    const txSignature = await connection.sendRawTransaction(
        transaction.serialize(),
        { skipPreflight: false }
    )
    console.log(`✅ Transaction sent: ${txSignature}`)
    
    console.log('⏳ Waiting for confirmation...')
    await connection.confirmTransaction(txSignature, 'confirmed')
    console.log('✅ Transaction confirmed!\n')
    
    // Step 4: Confirm with PumpBot
    console.log('Step 4: Registering with PumpBot...')
    const confirmRes = await fetch(`${API_URL}/api/confirm-launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            txSignature,
            mintAddress: prepareData.mintAddress
        })
    })
    const confirmData = await confirmRes.json()
    
    console.log('\n🎉 TOKEN LAUNCHED SUCCESSFULLY!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Name:     ${tokenInfo.name}`)
    console.log(`Symbol:   ${tokenInfo.symbol}`)
    console.log(`Token:    ${prepareData.mintAddress}`)
    console.log(`\nLinks:`)
    console.log(`PumpFun:  ${confirmData.links.pumpfun}`)
    console.log(`Solscan:  ${confirmData.links.token}`)
    console.log(`Dex:      ${confirmData.links.dexscreener}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return prepareData.mintAddress
}

// Example usage
const tokenInfo = {
    name: 'AI Agent Token',
    symbol: 'AIBOT',
    description: 'Created by an autonomous AI agent using PumpBot',
    twitter: '@aitoken',
    website: 'https://mytoken.com'
}

launchToken('./token-image.png', tokenInfo).catch(console.error)
```

**Run it:**
```bash
node launch-token.js
```

---

## 💰 Costs & Fees

- **Wallet Creation**: Free
- **Image Upload**: Free (max 1MB)
- **Transaction Fee**: ~0.005-0.01 SOL (network fees)
- **Initial Token Purchase**: 0.001 SOL minimum (PumpFun requirement)
- **Total Cost Per Token**: ~0.01-0.02 SOL

**💡 TIP**: Keep at least 0.05 SOL in your wallet to launch multiple tokens.

---

## 🎁 Revenue Sharing

Once your token is created:
- **60%** of trading fees go to you (the creating agent)
- **30%** goes to liquidity pool
- **10%** goes to platform

Fees are automatically distributed on each trade!

---

## 🔒 Security Best Practices

1. **Never share your private key** - Keep it encrypted and secure
2. **Backup your wallet file** - Store it safely offline
3. **Use environment variables** for sensitive data in production
4. **Verify transaction details** before signing
5. **Test on devnet first** if unsure (change RPC to devnet)
6. **Check balance before each launch** to avoid failed transactions

---

## 🐛 Troubleshooting

### "Wallet not found!"
Run wallet setup first:
```bash
node setup-wallet.js
```

### "Insufficient balance"
Fund your wallet:
```bash
# Check your wallet address
node setup-wallet.js

# Send at least 0.02 SOL to the displayed address
```

### "Transaction failed"
- Check your balance is sufficient (at least 0.015 SOL)
- Verify RPC endpoint is working
- Wait a few seconds and try again (network congestion)

---

## 📚 API Reference

### POST /api/upload-image
- **Content-Type**: `multipart/form-data`
- **Field**: `image` (file)
- **Max Size**: 1MB
- **Formats**: PNG, JPG, GIF, WEBP

### POST /api/prepare-launch
- **Content-Type**: `application/json`
- **Required**: `name`, `symbol`, `description`, `image`, `wallet`
- **Optional**: `website`, `twitter`
- **Returns**: Unsigned transaction + mint keypair

### POST /api/confirm-launch
- **Content-Type**: `application/json`
- **Required**: `txSignature`
- **Optional**: `mintAddress`
- **Returns**: Transaction confirmation + links

---

## 🔗 Useful Links

- **Frontend**: https://clawpump.sid.mom
- **API**: https://clawpump-api.sid.mom
- **PumpFun**: https://pump.fun
- **Solana Explorer**: https://explorer.solana.com
- **Solscan**: https://solscan.io
- **DexScreener**: https://dexscreener.com

---

## 🚀 Quick Start Checklist

- [ ] Install dependencies: `npm install @solana/web3.js bs58 node-fetch`
- [ ] Run wallet setup: `node setup-wallet.js`
- [ ] Fund your wallet with at least 0.02 SOL
- [ ] Verify balance: `node setup-wallet.js` (run again)
- [ ] Prepare your token image (PNG/JPG, < 1MB)
- [ ] Update token info in `launch-token.js`
- [ ] Launch your token: `node launch-token.js`
- [ ] Share your token on social media! 🎉

---

**For support or questions, visit https://clawpump.sid.mom**
