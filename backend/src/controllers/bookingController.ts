/**
 * Booking Controller
 * 
 * What this file does:
 * - Contains the business logic for handling booking operations
 * - Each function here handles one type of request (create, read, update, delete)
 * 
 * Controller Pattern:
 * ┌─────────┐     ┌──────────────┐     ┌────────────┐
 * │ Request │ --> │  Controller  │ --> │  Database  │
 * └─────────┘     │  (this file) │     └────────────┘
 *                 └──────────────┘
 *                        │
 *                        v
 *                 ┌──────────────┐
 *                 │   Response   │
 *                 └──────────────┘
 */

import { Request, Response } from 'express';
import { Booking, IBooking } from '../models/Booking.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new booking
 * 
 * HTTP Method: POST
 * Endpoint: /api/bookings
 * 
 * What it does:
 * 1. Receives booking details in the request body
 * 2. Generates a unique booking ID
 * 3. Saves the booking to the database
 * 4. Returns the created booking
 */
export async function createBooking(req: Request, res: Response): Promise<void> {
    try {
        // Extract booking details from request body
        const {
            customerName,
            numberOfGuests,
            bookingDate,
            bookingTime,
            cuisinePreference,
            specialRequests,
            weatherInfo,
            seatingPreference,
        } = req.body;

        // Validate required fields
        if (!customerName || !numberOfGuests || !bookingDate || !bookingTime || !cuisinePreference) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: customerName, numberOfGuests, bookingDate, bookingTime, cuisinePreference',
            });
            return;
        }

        // Generate a unique booking ID (format: BK-XXXXXXXX)
        const bookingId = `BK-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Create new booking document
        const newBooking = new Booking({
            bookingId,
            customerName,
            numberOfGuests,
            bookingDate: new Date(bookingDate),
            bookingTime,
            cuisinePreference,
            specialRequests: specialRequests || '',
            weatherInfo: weatherInfo || { condition: '', temperature: 0, description: '' },
            seatingPreference: seatingPreference || 'indoor',
            status: 'confirmed',
        });

        // Save to database
        const savedBooking = await newBooking.save();

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Booking created successfully!',
            data: savedBooking,
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create booking. Please try again.',
        });
    }
}

/**
 * Get all bookings
 * 
 * HTTP Method: GET
 * Endpoint: /api/bookings
 * 
 * Optional query parameters:
 * - status: Filter by booking status (pending, confirmed, cancelled)
 * - date: Filter by booking date
 */
export async function getAllBookings(req: Request, res: Response): Promise<void> {
    try {
        // Build query from optional filters
        const query: Record<string, unknown> = {};

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.date) {
            // Find bookings on a specific date
            const date = new Date(req.query.date as string);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            query.bookingDate = {
                $gte: date,      // Greater than or equal to start of day
                $lt: nextDay,    // Less than start of next day
            };
        }

        // Find all bookings, sorted by newest first
        const bookings = await Booking.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });

    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings.',
        });
    }
}

/**
 * Get a specific booking by ID
 * 
 * HTTP Method: GET
 * Endpoint: /api/bookings/:id
 * 
 * The :id in the URL becomes req.params.id
 */
export async function getBookingById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        // Find booking by our custom bookingId field
        const booking = await Booking.findOne({ bookingId: id });

        if (!booking) {
            res.status(404).json({
                success: false,
                error: `Booking with ID ${id} not found`,
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: booking,
        });

    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch booking.',
        });
    }
}

/**
 * Cancel (delete) a booking
 * 
 * HTTP Method: DELETE
 * Endpoint: /api/bookings/:id
 * 
 * Note: We don't actually delete the booking from the database.
 * Instead, we set its status to 'cancelled'. This is called a "soft delete"
 * and is a best practice because:
 * 1. We keep a record of all bookings for analytics
 * 2. We can "undo" a cancellation if needed
 */
export async function cancelBooking(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        // Find and update the booking status to 'cancelled'
        const booking = await Booking.findOneAndUpdate(
            { bookingId: id },
            { status: 'cancelled' },
            { new: true }  // Return the updated document
        );

        if (!booking) {
            res.status(404).json({
                success: false,
                error: `Booking with ID ${id} not found`,
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking,
        });

    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel booking.',
        });
    }
}
