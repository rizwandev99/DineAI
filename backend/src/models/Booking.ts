// Booking Model - defines structure of booking data in MongoDB
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for type safety
export interface IBooking extends Document {
    bookingId: string;
    customerName: string;
    numberOfGuests: number;
    bookingDate: Date;
    bookingTime: string;
    cuisinePreference: string;
    specialRequests: string;
    weatherInfo: {
        condition: string;
        temperature: number;
        description: string;
    };
    seatingPreference: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

// MongoDB Schema
const BookingSchema = new Schema<IBooking>(
    {
        bookingId: { type: String, required: true, unique: true, index: true },
        customerName: { type: String, required: true, trim: true },
        numberOfGuests: { type: Number, required: true, min: 1, max: 20 },
        bookingDate: { type: Date, required: true },
        bookingTime: { type: String, required: true },
        cuisinePreference: {
            type: String,
            required: true,
            enum: ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai', 'American', 'Other'],
        },
        specialRequests: { type: String, default: '' },
        weatherInfo: {
            condition: { type: String, default: '' },
            temperature: { type: Number, default: 0 },
            description: { type: String, default: '' },
        },
        seatingPreference: { type: String, enum: ['indoor', 'outdoor'], default: 'indoor' },
        status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
    },
    { timestamps: true }
);

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
