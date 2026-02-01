# Git Hooks

This directory contains git hooks to prevent security issues.

## Installation

### Windows (PowerShell)
```powershell
Copy-Item .git-hooks\pre-commit .git\hooks\pre-commit
```

### Linux/Mac
```bash
cp .git-hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Available Hooks

### pre-commit
Prevents committing:
- Private keys (Solana format)
- API keys
- Database credentials
- `.env` files
- Wallet files

**To bypass (use with extreme caution):**
```bash
git commit --no-verify
```

## Testing

```bash
# Test the hook
echo "PRIVATE_KEY=\"test123\"" > test-file.js
git add test-file.js
git commit -m "test"
# Should be blocked ✅
```
