"""
DineAI Voice Agent

A voice-enabled restaurant booking assistant using LiveKit Agents Framework.

Features:
1. Greets users and collects booking information via voice
2. Fetches real-time weather data for booking date
3. Suggests indoor/outdoor seating based on weather
4. Confirms booking details verbally
5. Stores booking in MongoDB database via backend API
"""

import logging
import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent
from livekit.agents.llm import function_tool
from livekit.plugins import openai, deepgram, silero
import aiohttp

# Load environment variables
load_dotenv(dotenv_path=".env.local")
logger = logging.getLogger("dineai-agent")
logging.basicConfig(level=logging.INFO)

# Configuration
BACKEND_URL = os.getenv("BACKEND_API_URL", "http://localhost:3001")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# ============================================================================
# FUNCTION TOOLS - These are callable by the LLM during conversation
# ============================================================================

@function_tool()
async def get_weather(date: str, location: str = "Mumbai") -> str:
    """
    Fetch weather forecast for a booking date and get seating recommendation.
    
    Args:
        date: The booking date in YYYY-MM-DD format (e.g., "2026-02-07")
        location: City name for weather lookup (default: Mumbai)
    
    Returns:
        Weather information with seating recommendation
    """
    logger.info(f"🌤️ Fetching weather for {date} in {location}")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{BACKEND_URL}/api/weather",
                params={"date": date, "location": location}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success"):
                        weather_data = data.get("data", {})
                        weather = weather_data.get("weather", {})
                        seating = weather_data.get("seatingSuggestion", {})
                        
                        result = {
                            "condition": weather.get("condition", "Unknown"),
                            "temperature": weather.get("temperature", 0),
                            "description": weather.get("description", ""),
                            "recommendation": seating.get("recommendation", "indoor"),
                            "seating_reason": seating.get("reason", ""),
                            "voice_response": seating.get("voiceResponse", "")
                        }
                        
                        logger.info(f"✅ Weather fetched: {result['condition']}, {result['temperature']}°C, recommend {result['recommendation']}")
                        return str(result)
                    else:
                        error = data.get("error", "Unknown error")
                        logger.error(f"Weather API error: {error}")
                        return f"Could not fetch weather: {error}"
                else:
                    logger.error(f"Weather API returned status {response.status}")
                    return "Weather service temporarily unavailable. Suggest indoor seating to be safe."
                    
    except Exception as e:
        logger.error(f"Weather fetch error: {e}")
        return "Could not fetch weather data. Recommend indoor seating to be safe."


@function_tool()
async def create_booking(
    customer_name: str,
    number_of_guests: int,
    booking_date: str,
    booking_time: str,
    cuisine_preference: str,
    seating_preference: str = "indoor",
    special_requests: str = "",
    weather_condition: str = "",
    weather_temperature: int = 0
) -> str:
    """
    Create a restaurant booking and save it to the database.
    
    Call this function ONLY after the customer has confirmed all booking details.
    
    Args:
        customer_name: Full name of the customer
        number_of_guests: Number of people dining (1-20)
        booking_date: Date in YYYY-MM-DD format
        booking_time: Time in HH:MM format (e.g., "19:00" or "7:00 PM")
        cuisine_preference: Type of cuisine (Italian, Chinese, Indian, Mexican, Japanese, Thai, American)
        seating_preference: Either "indoor" or "outdoor"
        special_requests: Any special requests like birthday, anniversary, dietary restrictions
        weather_condition: The weather condition for the booking date
        weather_temperature: Temperature in Celsius for the booking date
    
    Returns:
        Confirmation message with booking ID if successful, or error message
    """
    logger.info(f"📝 Creating booking for {customer_name}, {number_of_guests} guests on {booking_date} at {booking_time}")
    
    booking_data = {
        "customerName": customer_name,
        "numberOfGuests": number_of_guests,
        "bookingDate": booking_date,
        "bookingTime": booking_time,
        "cuisinePreference": cuisine_preference,
        "seatingPreference": seating_preference,
        "specialRequests": special_requests,
        "weatherInfo": {
            "condition": weather_condition,
            "temperature": weather_temperature,
            "description": f"{weather_condition}, {weather_temperature}°C"
        }
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{BACKEND_URL}/api/bookings",
                json=booking_data
            ) as response:
                if response.status in [200, 201]:
                    data = await response.json()
                    if data.get("success"):
                        booking = data.get("data", {})
                        booking_id = booking.get("bookingId", "Unknown")
                        logger.info(f"✅ Booking created successfully: {booking_id}")
                        return f"SUCCESS! Booking confirmed. Booking ID: {booking_id}. Customer: {customer_name}, {number_of_guests} guests, {booking_date} at {booking_time}, {cuisine_preference} cuisine, {seating_preference} seating."
                    else:
                        error = data.get("error", "Unknown error")
                        logger.error(f"Booking API error: {error}")
                        return f"Failed to create booking: {error}"
                else:
                    text = await response.text()
                    logger.error(f"Booking API returned status {response.status}: {text}")
                    return f"Booking service error. Please try again."
                    
    except Exception as e:
        logger.error(f"Booking creation error: {e}")
        return f"Failed to save booking: {str(e)}"


# ============================================================================
# AGENT DEFINITION
# ============================================================================

class DineAIAssistant(Agent):
    """
    DineAI Voice Assistant Agent
    
    A friendly restaurant booking assistant that guides customers through
    the booking process via natural voice conversation.
    """
    
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are DineAI, a friendly and professional restaurant booking assistant.

## YOUR GOAL
Help customers book restaurant tables through natural voice conversation.

## BOOKING FLOW (Follow these steps in order)

### Step 1: Greeting & Name
- Greet the customer warmly
- Ask for their name

### Step 2: Collect Booking Details (One at a time)
Ask for each piece of information separately:
1. Number of guests
2. Preferred date (convert to YYYY-MM-DD format internally)
3. Preferred time (convert to HH:MM format internally)
4. Cuisine preference (Italian, Chinese, Indian, Mexican, Japanese, Thai, or American)
5. Any special requests (birthday, anniversary, dietary restrictions) - this is optional

### Step 3: Fetch Weather & Suggest Seating
Once you have the DATE, use the get_weather function to fetch weather data.
Based on the weather response, suggest indoor or outdoor seating.
Ask the customer to confirm their seating preference.

### Step 4: Confirm All Details
Before creating the booking, verbally confirm ALL details with the customer:
- "Let me confirm your booking: [Name], party of [X], on [date] at [time], [cuisine] cuisine, [seating] seating. [Special requests if any]. Is that correct?"
- Wait for customer to say "yes" or confirm

### Step 5: Create Booking
ONLY after customer confirms, call the create_booking function with all details.
Tell the customer their booking ID and wish them a wonderful dining experience.

## IMPORTANT RULES
- Ask ONE question at a time
- Keep responses SHORT (1-2 sentences max)
- Be warm, friendly, and professional
- ALWAYS fetch weather before suggesting seating - do NOT make up weather data
- ALWAYS confirm before creating booking
- Use the customer's name occasionally to be personal
- If customer changes any detail, update and re-confirm before booking

## AVAILABLE FUNCTIONS
- get_weather(date, location): Get weather forecast and seating recommendation
- create_booking(...): Save the booking to database after customer confirms

Start by greeting the customer warmly and asking for their name.""",
            # Register function tools that the LLM can call
            tools=[get_weather, create_booking],
        )


# ============================================================================
# AGENT SERVER & SESSION
# ============================================================================

server = AgentServer()


@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    """
    Main entry point when a user connects to the room.
    Sets up the voice agent with STT, LLM, TTS, and function tools.
    """
    logger.info("=" * 60)
    logger.info("🎙️ NEW SESSION STARTED")
    logger.info(f"Room: {ctx.room.name}")
    logger.info("=" * 60)
    
    # Verify API keys are present
    keys = {
        "GROQ_API_KEY": os.getenv("GROQ_API_KEY"),
        "DEEPGRAM_API_KEY": os.getenv("DEEPGRAM_API_KEY"),
    }
    for name, value in keys.items():
        if value:
            logger.info(f"✓ {name} present (length: {len(value)})")
        else:
            logger.error(f"✗ {name} MISSING!")
    
    # Initialize VAD (Voice Activity Detection)
    vad = silero.VAD.load()
    logger.info("✓ VAD initialized")
    
    # Create the LLM with function tools
    llm = openai.LLM(
        base_url="https://api.groq.com/openai/v1",
        api_key=GROQ_API_KEY,
        model="llama-3.3-70b-versatile"
    )
    
    # Create AgentSession with all components
    session = AgentSession(
        stt=deepgram.STT(),
        llm=llm,
        tts=deepgram.TTS(),
        vad=vad,
    )
    
    logger.info("✓ AgentSession created")
    
    # Start the session with our agent (tools are passed to Agent constructor)
    await session.start(
        room=ctx.room,
        agent=DineAIAssistant(),
    )
    
    logger.info("✓ AgentSession started with function tools")
    
    # Generate initial greeting
    await session.generate_reply(
        instructions="Greet the customer warmly as a restaurant host and ask for their name to start the booking."
    )
    
    logger.info("✅ Agent ready - listening for voice input")
    logger.info("-" * 60)


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    agents.cli.run_app(server)
