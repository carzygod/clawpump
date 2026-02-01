import mongoose from 'mongoose'

const tokenSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    website: String,
    twitter: String,

    // Agent information
    agentName: String,
    agentWallet: {
        type: String,
        required: true
    },

    // Moltbook post info
    postId: String,
    postUrl: String,
    platform: {
        type: String,
        enum: ['moltbook', '4claw', 'moltx'],
        default: 'moltbook'
    },

    // Bonding curve data
    bondingCurveAddress: String,
    bondingProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    graduated: {
        type: Boolean,
        default: false
    },

    // Financial data
    marketCap: {
        type: Number,
        default: 0
    },
    currentPrice: Number,
    totalSupply: {
        type: Number,
        default: 1000000000 // 1 billion tokens (PumpFun standard)
    },

    // Trading stats
    volume24h: {
        type: Number,
        default: 0
    },
    priceChange24h: {
        type: Number,
        default: 0
    },

    // Transaction hashes
    deployTxHash: String,
    migrationTxHash: String,

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    graduatedAt: Date
}, {
    timestamps: true
})

// Indexes for efficient queries
tokenSchema.index({ marketCap: -1 })
tokenSchema.index({ volume24h: -1 })
tokenSchema.index({ createdAt: -1 })
tokenSchema.index({ agentWallet: 1 })

export default mongoose.model('Token', tokenSchema)
