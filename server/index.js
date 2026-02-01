import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import launchRouter from './routes/launch.js'
import uploadRouter from './routes/upload.js'
import tokensRouter from './routes/tokens.js'
import launchesRouter from './routes/launches.js'
import prepareLaunchRouter from './routes/prepare-launch.js'
import confirmLaunchRouter from './routes/confirm-launch.js'
import uploadImageRouter from './routes/upload-image.js'
import storeMetadataRouter from './routes/store-metadata.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
})

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve static files from public/uploads
app.use('/uploads', express.static('public/uploads'))
// Serve static metadata files
app.use('/metadata', express.static('public/metadata'))

// Make io accessible to routes
app.set('io', io)

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/pumpbot', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('✅ MongoDB connected')
    } catch (error) {
        console.error('MongoDB connection error:', error)
        // Continue without database for development
        console.log('⚠️  Continuing without database')
    }
}

connectDB()

// Routes
app.use('/api/launch', launchRouter) // Legacy endpoint (deprecated)
app.use('/api/upload', uploadRouter)
app.use('/api/upload-image', uploadImageRouter)
app.use('/api/store-metadata', storeMetadataRouter)
app.use('/api/tokens', tokensRouter)
app.use('/api/launches', launchesRouter)
app.use('/api/prepare-launch', prepareLaunchRouter) // New: Get unsigned transaction
app.use('/api/confirm-launch', confirmLaunchRouter) // New: Register completed launch

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    })
})

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
    })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
    console.log(`🚀 PumpBot server running on port ${PORT}`)
    console.log(`📡 WebSocket server ready`)
})

export { io }
