// Database connection using Mongoose
import mongoose from 'mongoose';

export async function connectDatabase(uri: string): Promise<void> {
    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}
