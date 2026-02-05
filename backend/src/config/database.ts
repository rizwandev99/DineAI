/**
 * Database Configuration
 * 
 * What this file does:
 * - Connects to MongoDB database
 * - Handles connection errors and reconnection
 * 
 * MongoDB is a database that stores data in a flexible, JSON-like format.
 * We use it to store our restaurant bookings.
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * 
 * @param uri - The MongoDB connection string (like a URL to your database)
 * 
 * Example URIs:
 * - Local: mongodb://localhost:27017/dineai
 * - Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dineai
 */
export async function connectDatabase(uri: string): Promise<void> {
    try {
        // Connect to MongoDB
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB database');

        // Handle connection events
        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        // Exit the process if we can't connect to the database
        process.exit(1);
    }
}

/**
 * Disconnect from the database
 * Used when shutting down the server gracefully
 */
export async function disconnectDatabase(): Promise<void> {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
}
