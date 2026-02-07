// Weather Controller - fetches real weather data from OpenWeatherMap
import { Request, Response } from 'express';
import axios from 'axios';

const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5';

interface WeatherData {
    condition: string;
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
}

// Get weather for a specific date
export async function getWeatherForDate(req: Request, res: Response): Promise<void> {
    try {
        const { date, location } = req.query;
        const city = (location as string) || process.env.DEFAULT_LOCATION || 'Mumbai';
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey || apiKey === 'your_openweather_api_key_here') {
            res.status(500).json({ success: false, error: 'OpenWeatherMap API key not configured' });
            return;
        }

        // Fetch forecast from OpenWeatherMap
        const response = await axios.get(`${OPENWEATHER_URL}/forecast`, {
            params: { q: city, appid: apiKey, units: 'metric' },
        });

        // Find closest forecast to requested date
        const requestedDate = date ? new Date(date as string) : new Date();
        const forecasts = response.data.list;

        let closest = forecasts[0];
        let minDiff = Math.abs(new Date(forecasts[0].dt * 1000).getTime() - requestedDate.getTime());

        for (const f of forecasts) {
            const diff = Math.abs(new Date(f.dt * 1000).getTime() - requestedDate.getTime());
            if (diff < minDiff) {
                minDiff = diff;
                closest = f;
            }
        }

        const weather: WeatherData = {
            condition: closest.weather[0].main,
            temperature: Math.round(closest.main.temp),
            description: closest.weather[0].description,
            humidity: closest.main.humidity,
            windSpeed: closest.wind.speed,
            icon: closest.weather[0].icon,
        };

        const suggestion = getSeatingSuggestion(weather);

        res.status(200).json({
            success: true,
            data: {
                location: city,
                date: requestedDate.toISOString().split('T')[0],
                weather,
                seatingSuggestion: suggestion,
            },
        });
    } catch (error) {
        console.error('Weather fetch error:', error);

        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                res.status(401).json({ success: false, error: 'Invalid API key' });
                return;
            }
            if (error.response?.status === 404) {
                res.status(404).json({ success: false, error: 'City not found' });
                return;
            }
        }

        res.status(500).json({ success: false, error: 'Failed to fetch weather' });
    }
}

// Suggest indoor/outdoor based on weather
function getSeatingSuggestion(weather: WeatherData) {
    const { condition, temperature, windSpeed } = weather;

    // Bad weather = indoor
    if (['Rain', 'Thunderstorm', 'Snow', 'Drizzle'].includes(condition)) {
        return {
            recommendation: 'indoor' as const,
            reason: `${condition} expected`,
            voiceResponse: `It looks like ${condition.toLowerCase()} on that day. I'd recommend indoor seating.`,
        };
    }

    // Too hot or too cold = indoor
    if (temperature > 35) {
        return {
            recommendation: 'indoor' as const,
            reason: 'Very hot weather',
            voiceResponse: `It's going to be ${temperature}°C. Our AC indoor area would be comfortable.`,
        };
    }
    if (temperature < 10) {
        return {
            recommendation: 'indoor' as const,
            reason: 'Cold weather',
            voiceResponse: `It might be chilly at ${temperature}°C. Indoor seating recommended.`,
        };
    }

    // High wind = indoor
    if (windSpeed > 10) {
        return {
            recommendation: 'indoor' as const,
            reason: 'High winds',
            voiceResponse: 'Strong winds expected. Indoor seating would be better.',
        };
    }

    // Good weather = outdoor
    return {
        recommendation: 'outdoor' as const,
        reason: 'Pleasant weather',
        voiceResponse: `Weather looks lovely at ${temperature}°C! Would you like outdoor seating?`,
    };
}
