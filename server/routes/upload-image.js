import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import fs from 'fs'

const router = express.Router()

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure upload directory
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads')

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR)
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const uniqueName = crypto.randomBytes(16).toString('hex')
        const ext = path.extname(file.originalname)
        cb(null, `${uniqueName}${ext}`)
    }
})

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'))
    }
}

// Configure multer with size limit (1MB)
const upload = multer({
    storage,
    limits: {
        fileSize: 1 * 1024 * 1024 // 1MB in bytes
    },
    fileFilter
})

/**
 * POST /api/upload-image
 * 
 * Upload an image file (max 1MB)
 * Returns the full URL to access the uploaded image
 */
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided',
                errors: ['Please upload an image file using the "image" field']
            })
        }

        // Get server URL from environment or request
        const protocol = req.protocol
        const host = req.get('host')
        const baseUrl = process.env.SERVER_URL || `${protocol}://${host}`

        // Construct full URL to the uploaded image
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`

        console.log('✅ Image uploaded:', {
            filename: req.file.filename,
            size: req.file.size,
            url: imageUrl
        })

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            url: imageUrl,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        })

    } catch (error) {
        console.error('❌ Upload error:', error)
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            errors: [error.message]
        })
    }
})

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large',
                errors: ['Image must be smaller than 1MB']
            })
        }
        return res.status(400).json({
            success: false,
            error: 'Upload error',
            errors: [error.message]
        })
    }

    if (error) {
        return res.status(400).json({
            success: false,
            error: 'Upload error',
            errors: [error.message]
        })
    }

    next()
})

export default router
