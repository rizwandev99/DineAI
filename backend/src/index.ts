// DineAI Backend Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import bookingRoutes from './routes/bookingRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));

// Log requests
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/bookings', bookingRoutes);
app.use('/api/weather', weatherRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route ${req.path} not found` });
});

// Start server
async function startServer() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dineai';
    await connectDatabase(mongoUri);

    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}

startServer();
