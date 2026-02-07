// Booking Routes - URL endpoints for booking operations
import { Router } from 'express';
import {
    createBooking,
    getAllBookings,
    getBookingById,
    cancelBooking,
} from '../controllers/bookingController.js';

const router = Router();

router.post('/', createBooking);       // Create new booking
router.get('/', getAllBookings);       // Get all bookings
router.get('/:id', getBookingById);    // Get booking by ID
router.delete('/:id', cancelBooking);  // Cancel booking

export default router;
