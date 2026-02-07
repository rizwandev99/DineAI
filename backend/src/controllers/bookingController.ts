// Booking Controller - handles all booking logic
import { Request, Response } from 'express';
import { Booking } from '../models/Booking.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new booking
export async function createBooking(req: Request, res: Response): Promise<void> {
    try {
        const { customerName, numberOfGuests, bookingDate, bookingTime, cuisinePreference, specialRequests, weatherInfo, seatingPreference } = req.body;

        // Check required fields
        if (!customerName || !numberOfGuests || !bookingDate || !bookingTime || !cuisinePreference) {
            res.status(400).json({ success: false, error: 'Missing required fields' });
            return;
        }

        // Create and save booking
        const booking = new Booking({
            bookingId: `BK-${uuidv4().slice(0, 8).toUpperCase()}`,
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

        const saved = await booking.save();
        res.status(201).json({ success: true, message: 'Booking created!', data: saved });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ success: false, error: 'Failed to create booking' });
    }
}

// Get all bookings
export async function getAllBookings(req: Request, res: Response): Promise<void> {
    try {
        const query: Record<string, unknown> = {};

        if (req.query.status) query.status = req.query.status;

        if (req.query.date) {
            const date = new Date(req.query.date as string);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            query.bookingDate = { $gte: date, $lt: nextDay };
        }

        const bookings = await Booking.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
}

// Get booking by ID
export async function getBookingById(req: Request, res: Response): Promise<void> {
    try {
        const booking = await Booking.findOne({ bookingId: req.params.id });

        if (!booking) {
            res.status(404).json({ success: false, error: 'Booking not found' });
            return;
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch booking' });
    }
}

// Cancel booking (soft delete)
export async function cancelBooking(req: Request, res: Response): Promise<void> {
    try {
        const booking = await Booking.findOneAndUpdate(
            { bookingId: req.params.id },
            { status: 'cancelled' },
            { new: true }
        );

        if (!booking) {
            res.status(404).json({ success: false, error: 'Booking not found' });
            return;
        }

        res.status(200).json({ success: true, message: 'Booking cancelled', data: booking });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ success: false, error: 'Failed to cancel booking' });
    }
}
