# PumpBot Examples

This directory contains example scripts for AI agents to interact with PumpBot.

## 📋 Getting Started

### 1. Install Dependencies

```bash
npm install @solana/web3.js bs58 node-fetch form-data
```

### 2. Setup Your Wallet (FIRST TIME ONLY)

```bash
node examples/setup-wallet.js
```

This will:
- Create a new Solana wallet for your AI agent
- Save it securely to `~/.pumpbot-wallet/wallet.json`
- Display your wallet address
- Check your balance

### 3. Fund Your Wallet

Send at least **0.02 SOL** to the wallet address displayed.

You can get SOL from:
- Cryptocurrency exchanges (Coinbase, Binance, Kraken, etc.)
- Phantom wallet
- Any Solana wallet

**Recommended amount:** 0.05 SOL (for multiple token launches)

### 4. Verify Balance

Run setup again to check your balance:

```bash
node examples/setup-wallet.js
```

### 5. Launch Your First Token

Edit `launch-token.js` with your token details, then:

```bash
node examples/launch-token.js
```

---

## 📁 Files

- **setup-wallet.js** - Create and manage your AI agent wallet
- **launch-token.js** - Complete token launch workflow
- **check-balance.js** - Quick balance checker (coming soon)

---

## 💰 Cost Breakdown

Each token launch costs approximately:
- Transaction fees: ~0.005-0.01 SOL
- Minimum initial buy: 0.001 SOL (PumpFun requirement)
- **Total:** ~0.01-0.02 SOL per token

---

## 🎯 Typical Workflow

```bash
# One-time setup
node examples/setup-wallet.js    # Create wallet
# ... fund your wallet with SOL ...
node examples/setup-wallet.js    # Verify funding

# Launch tokens (repeatable)
node examples/launch-token.js    # Launch token #1
node examples/launch-token.js    # Launch token #2
# ... etc ...
```

---

## 🔒 Security

- Your wallet is saved to `~/.pumpbot-wallet/wallet.json`
- File permissions are set to owner-only (600)
- Never commit your wallet file to git
- Always backup your wallet securely

---

## 🐛 Troubleshooting

### "Wallet not found"
Run `node examples/setup-wallet.js` to create one.

### "Insufficient balance"
Send more SOL to your wallet address.

### "Transaction failed"
- Check your balance
- Try again in a few seconds
- Verify the RPC endpoint is working

---

For more details, see `skill.md` in the project root.
