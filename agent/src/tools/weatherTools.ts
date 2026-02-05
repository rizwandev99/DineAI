/**
 * Weather Tools for Voice Agent
 * 
 * What this file does:
 * - Provides tools that the LLM can use to fetch weather data
 * - The LLM "calls" these functions when it needs weather information
 * 
 * How LLM Tools Work:
 * 1. We describe what the tool does (in the description)
 * 2. We describe what inputs it needs (parameters)
 * 3. When the LLM decides to use the tool, it generates the inputs
 * 4. Our code runs with those inputs and returns the result
 * 5. The LLM uses the result in its response
 */

import { z } from 'zod';
import axios from 'axios';

// Backend API URL from environment
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

/**
 * Tool Definition for getWeatherForecast
 * 
 * This object describes the tool to the LLM so it knows:
 * - What the tool does
 * - What parameters it needs
 * - When to use it
 */
export const weatherToolDefinition = {
    name: 'getWeatherForecast',
    description: `Get the weather forecast for a specific date and location. 
Use this tool IMMEDIATELY when the user mentions a date for their booking.
The response includes a ready-to-use voice response for suggesting indoor/outdoor seating.`,
    parameters: z.object({
        date: z.string().describe('The date to get weather for in YYYY-MM-DD format'),
        location: z.string().optional().describe('The city name (optional, defaults to configured city)'),
    }),
};

/**
 * Weather response type
 */
interface WeatherResponse {
    success: boolean;
    data?: {
        location: string;
        date: string;
        weather: {
            condition: string;
            temperature: number;
            description: string;
            humidity: number;
            windSpeed: number;
        };
        seatingSuggestion: {
            recommendation: 'indoor' | 'outdoor';
            reason: string;
            voiceResponse: string;
        };
    };
    error?: string;
}

/**
 * Execute the weather forecast tool
 * 
 * This function is called when the LLM invokes the tool.
 * It fetches real weather data from our backend API.
 * 
 * @param params - The parameters provided by the LLM
 * @returns Weather data including voice-ready response
 */
export async function executeWeatherTool(params: { date: string; location?: string }): Promise<string> {
    try {
        console.log('🌤️ Fetching weather for:', params);

        // Build query string
        const queryParams = new URLSearchParams({ date: params.date });
        if (params.location) {
            queryParams.set('location', params.location);
        }

        // Call our backend API
        const response = await axios.get<WeatherResponse>(
            `${BACKEND_URL}/api/weather?${queryParams.toString()}`
        );

        if (!response.data.success || !response.data.data) {
            return `I wasn't able to check the weather for that date. Would you prefer indoor seating to be safe?`;
        }

        const data = response.data.data;

        // Return formatted result for the LLM
        return JSON.stringify({
            location: data.location,
            date: data.date,
            temperature: data.weather.temperature,
            condition: data.weather.condition,
            description: data.weather.description,
            recommendation: data.seatingSuggestion.recommendation,
            voiceResponse: data.seatingSuggestion.voiceResponse,
        });

    } catch (error) {
        console.error('❌ Weather tool error:', error);
        return `I'm having trouble checking the weather right now. Would you prefer indoor or outdoor seating?`;
    }
}
