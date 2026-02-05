/**
 * Weather Controller
 * 
 * What this file does:
 * - Fetches real weather data from OpenWeatherMap API
 * - Provides weather information for booking dates
 * - Suggests indoor/outdoor seating based on weather
 * 
 * IMPORTANT: This fetches REAL data from an external API.
 * We do NOT use random or fake weather data.
 */

import { Request, Response } from 'express';
import axios from 'axios';

// OpenWeatherMap API configuration
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Weather condition type
 */
interface WeatherData {
    condition: string;      // Main weather (Clear, Rain, Clouds, etc.)
    temperature: number;    // Temperature in Celsius
    description: string;    // Detailed description
    humidity: number;       // Humidity percentage
    windSpeed: number;      // Wind speed in m/s
    icon: string;          // Weather icon code
}

/**
 * Get weather forecast for a specific date and location
 * 
 * HTTP Method: GET
 * Endpoint: /api/weather
 * 
 * Query Parameters:
 * - date: The date to get weather for (YYYY-MM-DD format)
 * - location: The city name (default: from environment variable)
 * 
 * How it works:
 * 1. OpenWeatherMap free tier gives 5-day forecast
 * 2. We find the forecast closest to the requested date/time
 * 3. We return weather data + seating suggestion
 */
export async function getWeatherForDate(req: Request, res: Response): Promise<void> {
    try {
        const { date, location } = req.query;

        // Use location from query or default from environment
        const cityName = (location as string) || process.env.DEFAULT_LOCATION || 'Mumbai';

        // Get API key from environment
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey || apiKey === 'your_openweather_api_key_here') {
            res.status(500).json({
                success: false,
                error: 'OpenWeatherMap API key not configured. Please set OPENWEATHER_API_KEY in .env file.',
            });
            return;
        }

        // Fetch 5-day forecast from OpenWeatherMap
        // Free tier limitation: Max 5 days ahead
        const response = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
            params: {
                q: cityName,
                appid: apiKey,
                units: 'metric',  // Get temperature in Celsius
            },
        });

        // Parse the requested date
        const requestedDate = date ? new Date(date as string) : new Date();

        // Find the forecast closest to the requested date
        const forecasts = response.data.list;
        let closestForecast = forecasts[0];
        let minDiff = Math.abs(new Date(forecasts[0].dt * 1000).getTime() - requestedDate.getTime());

        for (const forecast of forecasts) {
            const forecastDate = new Date(forecast.dt * 1000);
            const diff = Math.abs(forecastDate.getTime() - requestedDate.getTime());

            if (diff < minDiff) {
                minDiff = diff;
                closestForecast = forecast;
            }
        }

        // Extract weather data
        const weatherData: WeatherData = {
            condition: closestForecast.weather[0].main,
            temperature: Math.round(closestForecast.main.temp),
            description: closestForecast.weather[0].description,
            humidity: closestForecast.main.humidity,
            windSpeed: closestForecast.wind.speed,
            icon: closestForecast.weather[0].icon,
        };

        // Generate seating suggestion based on weather
        const seatingSuggestion = generateSeatingSuggestion(weatherData);

        // Return the response
        res.status(200).json({
            success: true,
            data: {
                location: cityName,
                date: requestedDate.toISOString().split('T')[0],
                weather: weatherData,
                seatingSuggestion: seatingSuggestion,
            },
        });

    } catch (error) {
        console.error('Error fetching weather:', error);

        // Handle specific API errors
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid OpenWeatherMap API key.',
                });
                return;
            }
            if (error.response?.status === 404) {
                res.status(404).json({
                    success: false,
                    error: 'City not found. Please check the location name.',
                });
                return;
            }
        }

        res.status(500).json({
            success: false,
            error: 'Failed to fetch weather data.',
        });
    }
}

/**
 * Generate seating suggestion based on weather conditions
 * 
 * Decision logic:
 * - Rain/Snow/Thunderstorm → Indoor
 * - Very hot (>35°C) or cold (<10°C) → Indoor
 * - High wind (>10 m/s) → Indoor
 * - Otherwise → Outdoor recommended if weather is pleasant
 */
function generateSeatingSuggestion(weather: WeatherData): {
    recommendation: 'indoor' | 'outdoor';
    reason: string;
    voiceResponse: string;
} {
    const { condition, temperature, windSpeed } = weather;

    // Check for bad weather conditions
    const badWeatherConditions = ['Rain', 'Thunderstorm', 'Snow', 'Drizzle'];

    if (badWeatherConditions.includes(condition)) {
        return {
            recommendation: 'indoor',
            reason: `${condition} expected`,
            voiceResponse: `It looks like there might be ${condition.toLowerCase()} on that day. I'd recommend our cozy indoor seating for a comfortable dining experience.`,
        };
    }

    // Check for extreme temperatures
    if (temperature > 35) {
        return {
            recommendation: 'indoor',
            reason: 'Very hot weather',
            voiceResponse: `It's going to be quite hot at ${temperature}°C. Our air-conditioned indoor area would be much more comfortable.`,
        };
    }

    if (temperature < 10) {
        return {
            recommendation: 'indoor',
            reason: 'Cold weather',
            voiceResponse: `It might be a bit chilly at ${temperature}°C. Would you prefer our warm indoor seating?`,
        };
    }

    // Check for high winds
    if (windSpeed > 10) {
        return {
            recommendation: 'indoor',
            reason: 'High winds',
            voiceResponse: `There might be some strong winds that day. Indoor seating would be more pleasant.`,
        };
    }

    // Good weather - suggest outdoor
    return {
        recommendation: 'outdoor',
        reason: 'Pleasant weather',
        voiceResponse: `The weather looks lovely at ${temperature}°C! Would you like to enjoy our beautiful outdoor patio?`,
    };
}
