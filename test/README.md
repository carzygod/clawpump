# PumpBot Integration Tests

This directory contains integration tests for the PumpBot platform.

## 🧪 Available Tests

### `bot-launch.test.js`

Complete end-to-end test that simulates a bot launching a token through PumpBot.

**What it tests:**
- ✅ Loading wallet from private key
- ✅ Checking wallet balance
- ✅ Requesting unsigned transaction from `/api/prepare-launch`
- ✅ Signing transaction with bot wallet + mint keypair
- ✅ Broadcasting transaction to Solana blockchain
- ✅ Confirming launch with `/api/confirm-launch`
- ✅ Verifying token registration in PumpBot

## 🚀 Running Tests

### Prerequisites

1. **Install dependencies:**
```bash
npm install @solana/web3.js bs58 node-fetch
```

2. **Start PumpBot server:**
```bash
npm run server:dev
```

3. **Prepare your wallet:**
   - You need a Solana wallet with at least 0.1 SOL
   - Get your private key in base58 format

### Getting Your Private Key

If you have a Phantom/Solflare wallet, you can export your private key:

```javascript
// In browser console or Node.js
const bs58 = require('bs58')
const { Keypair } = require('@solana/web3.js')

// If you have secret key as array
const secretKey = [123, 45, 67, ...] // Your secret key array
const privateKey = bs58.encode(secretKey)
console.log(privateKey)

// Or generate a new test wallet
const newWallet = Keypair.generate()
console.log('Address:', newWallet.publicKey.toBase58())
console.log('Private Key:', bs58.encode(newWallet.secretKey))
```

### Running the Test

1. **Edit the test file:**
```bash
# Open test/bot-launch.test.js
# Find the CONFIG section at the top
# Replace YOUR_PRIVATE_KEY_HERE with your actual private key
```

2. **Run the test:**
```bash
node test/bot-launch.test.js
```

### Expected Output

```
🤖 PumpBot Integration Test - Bot Token Launch
============================================================
📝 Loading wallet from private key...
✅ Wallet loaded: YourWalletAddress...

💰 Checking wallet balance...
   Balance: 0.5 SOL

🔨 Step 1: Requesting unsigned transaction from PumpBot...
✅ Unsigned transaction received
   Mint address will be: generated

✍️  Step 2: Signing transaction...
   Token mint address: TokenMintAddress...
✅ Transaction signed

📡 Step 3: Broadcasting to Solana...
   Transaction signature: 5Qx...
⏳ Waiting for confirmation...
✅ Transaction confirmed on Solana!

📋 Step 4: Confirming launch with PumpBot...
✅ Launch confirmed and registered!

============================================================
🎉 TOKEN LAUNCHED SUCCESSFULLY!
============================================================

Token Details:
  Name:        Test Bot Token
  Symbol:      TBOT
  Address:     TokenMintAddress...
  
Links:
  PumpFun:     https://pump.fun/TokenMintAddress...
  Solscan:     https://solscan.io/token/TokenMintAddress...
  Transaction: https://solscan.io/tx/5Qx...
  
Agent Rewards:
  Your Wallet: YourWalletAddress...
  Fee Share:   60% of all trading fees
  
Status:
  Bonding Curve: Active
  Progress:      0%
  Market Cap:    0 SOL

============================================================

✅ TEST PASSED - All steps completed successfully!
```

## ⚠️ Important Notes

### Network Selection

The test uses **mainnet** by default. To test on devnet:

1. Change `SOLANA_RPC` in the test file:
```javascript
SOLANA_RPC: "https://api.devnet.solana.com"
```

2. Ensure you have devnet SOL (get from faucet)
3. Configure PumpBot server for devnet

### Cost

- **Mainnet:** ~0.01-0.05 SOL per token launch
- **Devnet:** Free (use faucet SOL)

### Security

- ⚠️ **Never commit your private key to git**
- The test file is in `.gitignore` by default
- Use a separate test wallet, not your main wallet
- Only use testnet for development

### Troubleshooting

**Error: Insufficient balance**
- Ensure wallet has at least 0.1 SOL
- Check you're on the correct network (mainnet/devnet)

**Error: API Error (500)**
- Ensure PumpBot server is running (`npm run server:dev`)
- Check server logs for detailed error

**Error: Transaction failed**
- Check Solana network status (sometimes congested)
- Verify RPC endpoint is responsive
- Ensure wallet has enough SOL

**Error: Confirm failed**
- Transaction might not be confirmed yet
- Check transaction on Solscan
- Wait a few seconds and try manual confirmation

## 📝 Writing More Tests

To add more test scenarios:

1. Create a new file in `test/` directory
2. Follow the same structure as `bot-launch.test.js`
3. Test different scenarios:
   - Multiple token launches
   - Error handling
   - Edge cases (invalid metadata, etc.)
   - Token updates after launch

Example:
```javascript
// test/error-handling.test.js
// Test invalid inputs, network failures, etc.
```

## 🔗 References

- [PumpBot API Documentation](../README.md#api-reference)
- [Skill Documentation](../public/skill.md)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
