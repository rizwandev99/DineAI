/**
 * Booking Tools for Voice Agent
 * 
 * What this file does:
 * - Provides tools for creating and managing bookings
 * - The LLM calls these when it has collected all booking information
 * 
 * These tools connect our voice agent to the backend API,
 * allowing the booking to be saved in the database.
 */

import { z } from 'zod';
import axios from 'axios';

// Backend API URL from environment
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

/**
 * Tool Definition for createBooking
 * 
 * The LLM will call this tool when it has collected all the required
 * information from the customer.
 */
export const createBookingToolDefinition = {
    name: 'createBooking',
    description: `Create a new restaurant booking. 
Call this tool ONLY after you have collected ALL of the following from the customer:
- Customer name
- Number of guests
- Booking date
- Booking time
- Cuisine preference
- Seating preference (indoor/outdoor)

The special requests field is optional. After calling this tool, confirm the booking details with the customer.`,
    parameters: z.object({
        customerName: z.string().describe('The name for the reservation'),
        numberOfGuests: z.number().describe('How many people will be dining'),
        bookingDate: z.string().describe('The date of the booking in YYYY-MM-DD format'),
        bookingTime: z.string().describe('The time of the booking (e.g., "19:00" or "7:00 PM")'),
        cuisinePreference: z.enum(['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai', 'American', 'Other'])
            .describe('The type of cuisine the customer prefers'),
        seatingPreference: z.enum(['indoor', 'outdoor']).describe('Whether the customer wants indoor or outdoor seating'),
        specialRequests: z.string().optional().describe('Any special requests like birthday, anniversary, dietary restrictions'),
        weatherInfo: z.object({
            condition: z.string(),
            temperature: z.number(),
            description: z.string(),
        }).optional().describe('Weather information for the booking date'),
    }),
};

/**
 * Booking response type
 */
interface BookingResponse {
    success: boolean;
    message?: string;
    data?: {
        bookingId: string;
        customerName: string;
        numberOfGuests: number;
        bookingDate: string;
        bookingTime: string;
        cuisinePreference: string;
        seatingPreference: string;
        status: string;
    };
    error?: string;
}

/**
 * Execute the create booking tool
 * 
 * This function sends the booking data to our backend API
 * 
 * @param params - Booking details provided by the LLM
 * @returns Confirmation message with booking ID
 */
export async function executeCreateBookingTool(params: {
    customerName: string;
    numberOfGuests: number;
    bookingDate: string;
    bookingTime: string;
    cuisinePreference: string;
    seatingPreference: string;
    specialRequests?: string;
    weatherInfo?: {
        condition: string;
        temperature: number;
        description: string;
    };
}): Promise<string> {
    try {
        console.log('📅 Creating booking:', params);

        // Call our backend API to create the booking
        const response = await axios.post<BookingResponse>(
            `${BACKEND_URL}/api/bookings`,
            params
        );

        if (!response.data.success || !response.data.data) {
            return `I'm sorry, there was a problem creating your booking. ${response.data.error || 'Please try again.'}`;
        }

        const booking = response.data.data;

        // Return formatted confirmation for the LLM
        return JSON.stringify({
            success: true,
            bookingId: booking.bookingId,
            message: `Booking confirmed! Booking ID: ${booking.bookingId}`,
            details: {
                name: booking.customerName,
                guests: booking.numberOfGuests,
                date: booking.bookingDate,
                time: booking.bookingTime,
                cuisine: booking.cuisinePreference,
                seating: booking.seatingPreference,
            },
        });

    } catch (error) {
        console.error('❌ Booking tool error:', error);
        return `I apologize, but I wasn't able to complete your booking. Would you like to try again?`;
    }
}

/**
 * Tool Definition for getBooking
 * 
 * The LLM can use this to look up an existing booking
 */
export const getBookingToolDefinition = {
    name: 'getBooking',
    description: `Look up an existing booking by its booking ID.
Use this when a customer asks about their existing reservation.`,
    parameters: z.object({
        bookingId: z.string().describe('The booking ID to look up (e.g., BK-A1B2C3D4)'),
    }),
};

/**
 * Execute the get booking tool
 */
export async function executeGetBookingTool(params: { bookingId: string }): Promise<string> {
    try {
        console.log('🔍 Looking up booking:', params.bookingId);

        const response = await axios.get<BookingResponse>(
            `${BACKEND_URL}/api/bookings/${params.bookingId}`
        );

        if (!response.data.success || !response.data.data) {
            return `I couldn't find a booking with ID ${params.bookingId}. Could you please verify the booking ID?`;
        }

        const booking = response.data.data;

        return JSON.stringify({
            found: true,
            bookingId: booking.bookingId,
            name: booking.customerName,
            guests: booking.numberOfGuests,
            date: booking.bookingDate,
            time: booking.bookingTime,
            cuisine: booking.cuisinePreference,
            seating: booking.seatingPreference,
            status: booking.status,
        });

    } catch (error) {
        console.error('❌ Get booking error:', error);
        return `I'm having trouble looking up that booking. Could you please provide the booking ID again?`;
    }
}
