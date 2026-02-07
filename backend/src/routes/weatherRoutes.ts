// Weather Routes - URL endpoint for weather data
import { Router } from 'express';
import { getWeatherForDate } from '../controllers/weatherController.js';

const router = Router();

router.get('/', getWeatherForDate);  // Get weather for a date

export default router;
