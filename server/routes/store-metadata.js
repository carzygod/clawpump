import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const router = express.Router()

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure metadata directory
const METADATA_DIR = path.join(__dirname, '../../public/metadata')

// Ensure metadata directory exists
if (!fs.existsSync(METADATA_DIR)) {
    fs.mkdirSync(METADATA_DIR, { recursive: true })
}

/**
 * POST /api/store-metadata
 * 
 * Store token metadata as JSON and return URL
 */
router.post('/', (req, res) => {
    try {
        const { name, symbol, description, image, twitter, website } = req.body

        if (!name || !symbol || !description || !image) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                errors: ['name, symbol, description, and image are required']
            })
        }

        // Create metadata object
        const metadata = {
            name,
            symbol,
            description,
            image,
            showName: true
        }

        if (twitter) metadata.twitter = twitter
        if (website) metadata.website = website

        // Generate unique filename
        const metadataId = crypto.randomBytes(16).toString('hex')
        const filename = `${metadataId}.json`
        const filepath = path.join(METADATA_DIR, filename)

        // Write metadata to file
        fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2))

        // Get server URL
        const protocol = req.protocol
        const host = req.get('host')
        const baseUrl = process.env.SERVER_URL || `${protocol}://${host}`
        const metadataUri = `${baseUrl}/metadata/${filename}`

        console.log('✅ Metadata stored:', {
            id: metadataId,
            uri: metadataUri
        })

        res.status(200).json({
            success: true,
            message: 'Metadata stored successfully',
            metadataUri,
            metadataId,
            metadata
        })

    } catch (error) {
        console.error('❌ Store metadata error:', error)
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            errors: [error.message]
        })
    }
})

/**
 * GET /api/store-metadata/:id
 * 
 * Retrieve stored metadata by ID
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params
        const filename = `${id}.json`
        const filepath = path.join(METADATA_DIR, filename)

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({
                success: false,
                error: 'Metadata not found'
            })
        }

        const metadata = JSON.parse(fs.readFileSync(filepath, 'utf8'))

        res.status(200).json(metadata)

    } catch (error) {
        console.error('❌ Retrieve metadata error:', error)
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            errors: [error.message]
        })
    }
})

export default router
