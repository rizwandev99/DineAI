/**
 * Weather Routes
 * 
 * What this file does:
 * - Defines the URL endpoint for weather information
 * - Connects the endpoint to the weather controller
 * 
 * API Design:
 * ┌───────────────────────────────────────────────────────────────────┐
 * │ Method │ Endpoint              │ Description                     │
 * ├───────────────────────────────────────────────────────────────────┤
 * │ GET    │ /api/weather          │ Get weather forecast            │
 * └───────────────────────────────────────────────────────────────────┘
 */

import { Router } from 'express';
import { getWeatherForDate } from '../controllers/weatherController.js';

const router = Router();

/**
 * GET /api/weather
 * Get weather forecast for a specific date and location
 * 
 * Query Parameters:
 * - date: Date to get weather for (YYYY-MM-DD format)
 * - location: City name (optional, defaults to configured city)
 * 
 * Example: GET /api/weather?date=2024-02-15&location=Mumbai
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     location: "Mumbai",
 *     date: "2024-02-15",
 *     weather: {
 *       condition: "Clear",
 *       temperature: 28,
 *       description: "clear sky",
 *       humidity: 65,
 *       windSpeed: 3.5
 *     },
 *     seatingSuggestion: {
 *       recommendation: "outdoor",
 *       reason: "Pleasant weather",
 *       voiceResponse: "The weather looks lovely at 28°C! Would you like to enjoy our beautiful outdoor patio?"
 *     }
 *   }
 * }
 */
router.get('/', getWeatherForDate);

export default router;
