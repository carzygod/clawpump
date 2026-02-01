import express from 'express'
import Token from '../models/Token.js'

const router = express.Router()

// Get recent launches
router.get('/', async (req, res) => {
    try {
        const { limit = 20 } = req.query

        const launches = await Token.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('address name symbol image agentName postUrl createdAt marketCap bondingProgress')

        res.json({
            launches,
            count: launches.length
        })
    } catch (error) {
        console.error('Error fetching launches:', error)
        res.status(500).json({
            error: 'Failed to fetch launches',
            message: error.message
        })
    }
})

export default router
