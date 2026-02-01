import express from 'express'
import axios from 'axios'

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { image, name } = req.body

        if (!image) {
            return res.status(400).json({
                error: 'Missing image data',
                errors: ['image field is required (base64 or URL)']
            })
        }

        let imageUrl = image

        // If it's a URL, re-host it on our service
        if (image.startsWith('http')) {
            // For now, just return the URL
            // In production, you'd upload to IPFS/Arweave
            imageUrl = image
        } else if (image.startsWith('data:')) {
            // Base64 image - upload to IPFS/Arweave
            // For development, return a placeholder
            const timestamp = Date.now()
            imageUrl = `https://iili.io/placeholder-${timestamp}.jpg`
        }

        res.json({
            success: true,
            url: imageUrl,
            hint: 'Use the "url" value in your !pumpbot JSON as the "image" field'
        })

    } catch (error) {
        console.error('Upload error:', error)
        res.status(500).json({
            error: 'Upload failed',
            errors: [error.message]
        })
    }
})

export default router
