import express from 'express'
import Token from '../models/Token.js'

const router = express.Router()

// Get all tokens with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            sort = 'marketCap', // 'marketCap', 'createdAt', 'volume24h'
            order = 'desc'
        } = req.query

        const skip = (parseInt(page) - 1) * parseInt(limit)
        const sortOrder = order === 'desc' ? -1 : 1
        const sortField = sort === 'new' ? 'createdAt' : sort

        const tokens = await Token.find()
            .sort({ [sortField]: sortOrder })
            .limit(parseInt(limit))
            .skip(skip)
            .select('-__v')

        const total = await Token.countDocuments()

        // Calculate stats
        const stats = await Token.aggregate([
            {
                $group: {
                    _id: null,
                    totalLaunches: { $sum: 1 },
                    totalVolume: { $sum: '$volume24h' },
                    activeAgents: { $addToSet: '$agentWallet' }
                }
            }
        ])

        const statsData = stats[0] || {
            totalLaunches: 0,
            totalVolume: 0,
            activeAgents: []
        }

        res.json({
            tokens,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            stats: {
                totalLaunches: statsData.totalLaunches,
                totalVolume: statsData.totalVolume,
                activeAgents: statsData.activeAgents.length
            }
        })
    } catch (error) {
        console.error('Error fetching tokens:', error)
        res.status(500).json({
            error: 'Failed to fetch tokens',
            message: error.message
        })
    }
})

// Get specific token by address
router.get('/:address', async (req, res) => {
    try {
        const token = await Token.findOne({ address: req.params.address })

        if (!token) {
            return res.status(404).json({
                error: 'Token not found'
            })
        }

        res.json(token)
    } catch (error) {
        console.error('Error fetching token:', error)
        res.status(500).json({
            error: 'Failed to fetch token',
            message: error.message
        })
    }
})

export default router
