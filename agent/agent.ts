/**
 * DineAI Voice Agent - Main Entry Point (Node.js)
 * 
 * What this file does:
 * - Creates a LiveKit voice agent for restaurant booking
 * - Connects to LiveKit Cloud to receive voice input
 * - Uses OpenAI Realtime API for voice conversation
 * - Handles the booking conversation flow
 * 
 * How to run:
 * - Development: npm run dev (connects to LiveKit Cloud)
 * - Use LiveKit Playground to test: https://agents-playground.livekit.io/
 */

import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

import { defineAgent, multimodal } from '@livekit/agents';
import { openai } from '@livekit/agents-plugin-openai';
import axios from 'axios';

// Backend API URL
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

/**
 * System instructions for the AI agent
 */
const SYSTEM_INSTRUCTIONS = `You are DineAI, a friendly and professional voice assistant that helps customers book restaurant tables over voice conversation.

## Your Personality
- Warm, welcoming, and professional like a top restaurant host
- Speak naturally and conversationally, not like a robot
- Use simple words and short sentences (this is voice, not text!)
- Be enthusiastic about helping customers have a great dining experience

## Your Main Goal
Help customers book a restaurant table by collecting the following information IN THIS ORDER:
1. Customer name
2. Number of guests
3. Preferred date and time
4. Cuisine preference (Italian, Chinese, Indian, Mexican, Japanese, Thai, or American)
5. Special requests (birthday, anniversary, dietary restrictions, etc.)

## Important Conversation Rules
- Ask for ONE piece of information at a time
- Always confirm what you heard before moving on
- Keep responses SHORT - aim for 1-2 sentences when possible
- Use natural transitions like "Great!", "Perfect!", "Sounds wonderful!"

## Weather Integration
- When the user provides a booking date, fetch weather information
- Based on the weather, suggest indoor or outdoor seating

## Booking Flow Example
1. Greet: "Welcome to DineAI! I'd be happy to help you book a table. What's your name?"
2. Name: "Nice to meet you! How many guests will be joining?"
3. Guests: "Perfect, a table for 4! What date would you like to come in?"
4. Date/Time: "Wonderful! And what time works best for you?"
5. Weather Check: "The weather looks lovely that day! Would you prefer indoor or outdoor seating?"
6. Cuisine: "Great choice! What type of cuisine are you in the mood for?"
7. Special Requests: "Is this for any special occasion?"
8. Confirm: "Let me confirm and create your booking..."

Remember: You are having a VOICE conversation. Keep responses concise and natural!`;

/**
 * Helper function to fetch weather
 */
async function getWeather(date: string, location: string = 'Mumbai'): Promise<any> {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/weather`, {
            params: { date, location }
        });
        return response.data.data;
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
}

/**
 * Helper function to create booking
 */
async function createBooking(bookingData: any): Promise<any> {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/bookings`, bookingData);
        return response.data;
    } catch (error) {
        console.error('Booking creation error:', error);
        return null;
    }
}

/**
 * Define the DineAI Voice Agent
 */
export default defineAgent({
    entry: async (ctx) => {
        console.log('');
        console.log('🍽️ ========================================');
        console.log('🍽️ DineAI Voice Agent - New Session');
        console.log('🍽️ ========================================');
        console.log(`📍 Room: ${ctx.room.name}`);
        console.log('');

        // Connect to the room
        await ctx.connect();

        // Create OpenAI Realtime session
        const model = new openai.realtime.RealtimeModel({
            instructions: SYSTEM_INSTRUCTIONS,
            voice: 'alloy', // Natural voice
            temperature: 0.7,
            modalities: ['text', 'audio'],
        });

        // Start multimodal agent session
        const agent = new multimodal.MultimodalAgent({ model });

        // Start the session
        const session = await agent
            .start(ctx.room)
            .then(() => {
                console.log('✅ Session started - Agent is listening');

                // Send initial greeting
                session.conversation.item.create({
                    type: 'message',
                    role: 'assistant',
                    content: [
                        {
                            type: 'input_text',
                            text: "Welcome to DineAI! I'd be happy to help you book a table. What's your name?"
                        }
                    ]
                });

                session.response.create();
            });

        console.log('🎤 Greeting sent - conversation started!');
    },
});
