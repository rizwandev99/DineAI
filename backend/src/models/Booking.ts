/**
 * Booking Model - MongoDB Schema
 * 
 * What this file does:
 * - Defines the structure (schema) of a booking in our database
 * - A schema is like a blueprint that describes what fields each booking has
 * 
 * Think of it like a form:
 * - Each field is a question on the form
 * - The type (String, Number, Date) tells us what kind of answer is expected
 * - "required: true" means the field must be filled in
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * TypeScript interface for a Booking
 * This helps us catch errors during development
 */
export interface IBooking extends Document {
    bookingId: string;           // Unique ID like "BK-12345"
    customerName: string;        // Guest's name
    numberOfGuests: number;      // How many people are coming
    bookingDate: Date;           // The date of the booking
    bookingTime: string;         // Time like "19:00" or "7:30 PM"
    cuisinePreference: string;   // Italian, Chinese, Indian, etc.
    specialRequests: string;     // Birthday, anniversary, dietary needs
    weatherInfo: {               // Weather data for the booking date
        condition: string;         // sunny, rainy, cloudy, etc.
        temperature: number;       // Temperature in Celsius
        description: string;       // Human-readable description
    };
    seatingPreference: string;   // indoor or outdoor
    status: 'pending' | 'confirmed' | 'cancelled';  // Booking status
    createdAt: Date;             // When the booking was made
    updatedAt: Date;             // When it was last modified
}

/**
 * Mongoose Schema Definition
 * This tells MongoDB exactly how to store our data
 */
const BookingSchema = new Schema<IBooking>(
    {
        // Unique booking ID - we generate this ourselves
        bookingId: {
            type: String,
            required: true,
            unique: true,  // No two bookings can have the same ID
            index: true,   // Makes searching by bookingId faster
        },

        // Customer's name - required field
        customerName: {
            type: String,
            required: true,
            trim: true,    // Removes extra spaces from beginning/end
        },

        // Number of guests - must be at least 1
        numberOfGuests: {
            type: Number,
            required: true,
            min: 1,        // Minimum 1 guest
            max: 20,       // Maximum 20 guests (reasonable limit)
        },

        // Date of the booking
        bookingDate: {
            type: Date,
            required: true,
        },

        // Time of the booking (stored as string for flexibility)
        bookingTime: {
            type: String,
            required: true,
        },

        // Cuisine preference
        cuisinePreference: {
            type: String,
            required: true,
            enum: ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai', 'American', 'Other'],
        },

        // Special requests - optional field
        specialRequests: {
            type: String,
            default: '',   // Empty string if not provided
        },

        // Weather information - stored as an object
        weatherInfo: {
            condition: { type: String, default: '' },
            temperature: { type: Number, default: 0 },
            description: { type: String, default: '' },
        },

        // Indoor or outdoor seating
        seatingPreference: {
            type: String,
            enum: ['indoor', 'outdoor'],
            default: 'indoor',
        },

        // Booking status
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'confirmed',
        },
    },
    {
        // Automatically add createdAt and updatedAt timestamps
        timestamps: true,
    }
);

/**
 * Create and export the model
 * 
 * A "model" is like a class that lets us:
 * - Create new bookings
 * - Find existing bookings
 * - Update bookings
 * - Delete bookings
 */
export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
