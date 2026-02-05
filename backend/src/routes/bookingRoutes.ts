/**
 * Booking Routes
 * 
 * What this file does:
 * - Defines the URL endpoints for booking operations
 * - Connects each endpoint to its controller function
 * 
 * REST API Design:
 * ┌───────────────────────────────────────────────────────────────────┐
 * │ Method │ Endpoint              │ Description                     │
 * ├───────────────────────────────────────────────────────────────────┤
 * │ POST   │ /api/bookings         │ Create a new booking            │
 * │ GET    │ /api/bookings         │ Get all bookings                │
 * │ GET    │ /api/bookings/:id     │ Get a specific booking          │
 * │ DELETE │ /api/bookings/:id     │ Cancel a booking                │
 * └───────────────────────────────────────────────────────────────────┘
 */

import { Router } from 'express';
import {
    createBooking,
    getAllBookings,
    getBookingById,
    cancelBooking,
} from '../controllers/bookingController.js';

// Create a new router instance
const router = Router();

/**
 * POST /api/bookings
 * Create a new restaurant booking
 * 
 * Request body should contain:
 * {
 *   customerName: "John Doe",
 *   numberOfGuests: 4,
 *   bookingDate: "2024-02-15",
 *   bookingTime: "19:00",
 *   cuisinePreference: "Italian",
 *   specialRequests: "Anniversary celebration",
 *   weatherInfo: { condition: "Clear", temperature: 25 },
 *   seatingPreference: "outdoor"
 * }
 */
router.post('/', createBooking);

/**
 * GET /api/bookings
 * Retrieve all bookings
 * 
 * Optional query parameters:
 * - ?status=confirmed (filter by status)
 * - ?date=2024-02-15 (filter by date)
 */
router.get('/', getAllBookings);

/**
 * GET /api/bookings/:id
 * Retrieve a specific booking by its ID
 * 
 * Example: GET /api/bookings/BK-A1B2C3D4
 */
router.get('/:id', getBookingById);

/**
 * DELETE /api/bookings/:id
 * Cancel a booking (sets status to 'cancelled')
 * 
 * Example: DELETE /api/bookings/BK-A1B2C3D4
 */
router.delete('/:id', cancelBooking);

export default router;
