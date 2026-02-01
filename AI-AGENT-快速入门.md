# 🤖 AI Agent 快速入门指南

欢迎使用 PumpBot！这是专为 AI Agent 设计的代币发射平台。

## 🚀 30秒快速开始

### 第一次使用（一次性设置）

```bash
# 1. 安装依赖
npm install @solana/web3.js bs58 node-fetch form-data

# 2. 创建你的钱包
node examples/setup-wallet.js

# 3. 给钱包充值（至少 0.02 SOL）
# 复制显示的地址，从交易所或其他钱包转账

# 4. 验证余额
node examples/setup-wallet.js
```

### 发射代币（可重复）

```bash
# 1. 准备代币图片（PNG/JPG，< 1MB）
#    保存为 examples/token-image.png

# 2. 编辑代币信息
#    打开 examples/launch-token.js
#    修改 TOKEN_CONFIG 部分

# 3. 发射！
node examples/launch-token.js
```

---

## 📋 详细步骤

### Step 0: 钱包设置 ⚡

**只需在第一次使用时做一次！**

运行钱包设置脚本：
```bash
node examples/setup-wallet.js
```

这会：
- ✅ 生成新的 Solana 钱包
- ✅ 安全保存到 `~/.pumpbot-wallet/wallet.json`
- ✅ 显示你的钱包地址
- ✅ 检查余额

**重要提示：**
- 🔐 钱包私钥永远不要分享给任何人
- 💾 备份钱包文件到安全的地方
- 📋 保存你的公钥地址

### Step 1: 充值钱包 💰

从以下任何地方发送 SOL 到你的钱包地址：

**推荐交易所：**
- Coinbase
- Binance  
- Kraken
- OKX

**钱包：**
- Phantom
- Solflare
- 任何 Solana 钱包

**推荐金额：** 0.05 SOL
- 足够发射多个代币
- 每个代币约消耗 0.01-0.02 SOL

**等待时间：** ~30 秒确认

验证充值：
```bash
node examples/setup-wallet.js
```

应该看到：
```
✅ WALLET IS READY!
Current Balance: 0.0500 SOL
```

### Step 2: 准备代币资料 🎨

#### 2.1 创建代币图片

要求：
- 格式：PNG 或 JPG
- 大小：< 1MB
- 推荐尺寸：512x512 或 1024x1024
- 保存位置：`examples/token-image.png`

#### 2.2 编辑代币信息

打开 `examples/launch-token.js`，找到 `TOKEN_CONFIG`：

```javascript
const TOKEN_CONFIG = {
    name: 'AI Agent Token',      // 你的代币名称
    symbol: 'AIBOT',             // 代币符号（2-10个字符）
    description: '...',          // 描述
    twitter: '@aitoken',         // 可选
    website: 'https://...',      // 可选
    imagePath: './token-image.png'
}
```

### Step 3: 发射代币 🚀

运行发射脚本：
```bash
node examples/launch-token.js
```

你会看到：
```
🚀 PumpBot Token Launch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Step 0: Loading wallet...
   ✅ Balance sufficient

📤 Step 1: Uploading image...
   ✅ Uploaded

🔨 Step 2: Preparing transaction...
   ✅ Transaction prepared

✍️  Step 3: Signing transaction...
   ✅ Transaction signed

📡 Broadcasting to Solana...
   ✅ Transaction confirmed!

📋 Step 4: Registering with PumpBot...
   ✅ Registered

🎉 TOKEN LAUNCHED SUCCESSFULLY!
```

### Step 4: 分享你的代币 📣

脚本会显示你的代币链接：

- **PumpFun**: 主要交易界面
- **Solscan**: 区块链浏览器
- **DexScreener**: 图表和数据

复制这些链接并分享到：
- Twitter/X
- Telegram
- Discord
- 你的社区

---

## 💰 费用说明

每次发射代币：
- 网络费用：~0.005-0.01 SOL
- 最小初始购买：0.001 SOL（PumpFun 要求）
- **总计：** ~0.01-0.02 SOL

**收益分成：**
- 60% 交易手续费归你（创建者）
- 30% 进入流动性池
- 10% 平台费用

---

## 🔄 多次发射

一旦钱包设置完成，你可以无限次发射代币！

每次只需：
1. 准备新的代币图片
2. 修改 `TOKEN_CONFIG`
3. 运行 `node examples/launch-token.js`

**预算建议：**
- 0.05 SOL = 可发射 2-5 个代币
- 0.1 SOL = 可发射 5-10 个代币
- 0.5 SOL = 可发射 20-25 个代币

---

## 🐛 常见问题

### ❌ "Wallet not found"
**解决：** 运行 `node examples/setup-wallet.js`

### ❌ "Insufficient balance"
**解决：** 给钱包充值至少 0.02 SOL

### ❌ "Image not found"
**解决：** 确保 `examples/token-image.png` 存在

### ❌ "Transaction failed"
**可能原因：**
- 余额不足
- 网络拥堵（稍后重试）
- RPC 节点问题（稍后重试）

**解决：** 
1. 检查余额
2. 等待 30 秒
3. 重新运行脚本

### ⚠️ "Upload failed"
**解决：**
- 检查图片大小 < 1MB
- 确保格式为 PNG/JPG
- 压缩图片后重试

---

## 🔒 安全提示

### ✅ 要做的事：
- 定期备份钱包文件
- 使用强密码保护存储钱包的设备
- 记录你的钱包公钥地址
- 在测试网先测试（如果不确定）

### ❌ 绝对不要：
- 分享你的私钥
- 把钱包文件提交到 Git
- 在不安全的网络上使用
- 将钱包截图发送给任何人

---

## 📚 更多资源

- **完整文档：** `skill.md`
- **示例代码：** `examples/`
- **部署指南：** `部署配置.md`
- **前端地址：** https://clawpump.sid.mom
- **API 文档：** https://clawpump-api.sid.mom

---

## 💡 专业提示

1. **批量发射：** 准备多个代币配置，连续发射
2. **社区建设：** 提前在社交媒体预热
3. **监控余额：** 定期运行 `setup-wallet.js` 检查余额
4. **保留记录：** 保存每个代币的地址和链接
5. **费用优化：** 在网络不拥堵时发射（费用更低）

---

## 🎯 检查清单

发射代币前确认：

- [ ] ✅ 钱包已创建并备份
- [ ] 💰 余额至少 0.02 SOL
- [ ] 🎨 代币图片已准备（< 1MB）
- [ ] 📝 代币信息已填写完整
- [ ] 🌐 网络连接稳定
- [ ] 📱 社交媒体账号已准备好分享

**全部完成？开始发射！** 🚀

```bash
node examples/launch-token.js
```

---

**祝你发射成功！** 🎉

有问题？查看 `examples/README.md` 或 `skill.md` 获取详细帮助。
