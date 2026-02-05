/**
 * DineAI Backend Server
 * 
 * Main entry point for the Express.js API server
 * 
 * What this server does:
 * 1. Connects to MongoDB database
 * 2. Sets up API routes for bookings and weather
 * 3. Handles CORS (Cross-Origin Resource Sharing) for frontend access
 * 4. Listens for incoming HTTP requests
 * 
 * How to run:
 * - Development: npm run dev (uses tsx for hot reloading)
 * - Production: npm run build && npm start
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import bookingRoutes from './routes/bookingRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Create Express application
const app: Express = express();

// Get port from environment variable or use default
const PORT = process.env.PORT || 3001;

/**
 * Middleware Setup
 * 
 * Middleware are functions that run before your route handlers.
 * They can modify the request, check authentication, parse data, etc.
 */

// Parse JSON request bodies
// This allows us to access req.body when clients send JSON data
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing)
// This allows the frontend (running on a different port) to access our API
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Frontend URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Log incoming requests (useful for debugging)
app.use((req: Request, res: Response, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

/**
 * API Routes
 * 
 * All API endpoints start with /api to distinguish them from frontend routes
 */

// Health check endpoint - useful for monitoring if server is running
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'DineAI Backend API',
    });
});

// Mount booking routes at /api/bookings
app.use('/api/bookings', bookingRoutes);

// Mount weather routes at /api/weather
app.use('/api/weather', weatherRoutes);

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
});

/**
 * Start the server
 * 
 * This function:
 * 1. Connects to MongoDB
 * 2. Starts listening for HTTP requests
 */
async function startServer(): Promise<void> {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dineai';
        await connectDatabase(mongoUri);

        // Start listening for requests
        app.listen(PORT, () => {
            console.log('');
            console.log('🍽️  ========================================');
            console.log('🍽️  DineAI Backend API Server');
            console.log('🍽️  ========================================');
            console.log(`🚀 Server running at: http://localhost:${PORT}`);
            console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📅 Bookings API: http://localhost:${PORT}/api/bookings`);
            console.log(`🌤️  Weather API: http://localhost:${PORT}/api/weather`);
            console.log('🍽️  ========================================');
            console.log('');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();
