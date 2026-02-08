# DineAI Voice Agent

import os
import aiohttp
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent
from livekit.agents.llm import function_tool
from livekit.plugins import openai, deepgram, silero

# Load secrets from .env.local
load_dotenv(dotenv_path=".env.local")

BACKEND_URL = os.getenv("BACKEND_API_URL", "http://localhost:3001")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# Tool 1: Get Weather
@function_tool()
async def get_weather(date: str, location: str = "Mumbai") -> str:
    """Fetch weather for booking date
    
    Args:
        date: Must be in YYYY-MM-DD format (e.g., "2026-02-15")
        location: Actual city name (e.g., "Mumbai", "Delhi") - DO NOT use phrases like "your location"
    """
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"{BACKEND_URL}/api/weather",
            params={"date": date, "location": location}
        ) as resp:
            data = await resp.json()
            return str(data.get("data", {}))


# Tool 2: Create Booking
@function_tool()
async def create_booking(
    customer_name: str,
    number_of_guests: int,
    booking_date: str,
    booking_time: str,
    cuisine_preference: str,
    seating_preference: str = "indoor",
    special_requests: str = ""
) -> str:
    """Save booking to database"""
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{BACKEND_URL}/api/bookings",
            json={
                "customerName": customer_name,
                "numberOfGuests": number_of_guests,
                "bookingDate": booking_date,
                "bookingTime": booking_time,
                "cuisinePreference": cuisine_preference,
                "seatingPreference": seating_preference,
                "specialRequests": special_requests
            }
        ) as resp:
            data = await resp.json()
            booking_id = data.get("data", {}).get("bookingId", "Unknown")
            return f"Booking confirmed! ID: {booking_id}"


# The AI Assistant
class DineAIAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are DineAI, a restaurant booking assistant.
            
            FLOW:
            1. Ask name
            2. Ask number of guests
            3. Ask date and time
            4. Call get_weather function, suggest seating based on result
            5. Ask cuisine preference
            6. Ask special requests
            7. Confirm all details with user
            8. MUST call create_booking function to save - you will get booking ID from it
            
            CRITICAL RULES:
            - NEVER make up a booking ID - you MUST call create_booking to get one
            - Ask ONE question at a time
            - Be brief and friendly""",
            tools=[get_weather, create_booking]
        )


# Server Setup
server = AgentServer()


@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    """Main entry point when user connects"""
    session = AgentSession(
        stt=deepgram.STT(),           # Ears - Listens to user
        llm=openai.LLM(               # Brain - Thinks and responds
            base_url="https://api.groq.com/openai/v1",
            api_key=GROQ_API_KEY,
            model="llama-3.3-70b-versatile"
        ),
        tts=deepgram.TTS(),           # Mouth - Speaks to user
        vad=silero.VAD.load()         # Detects when user is speaking
    )
    
    await session.start(room=ctx.room, agent=DineAIAssistant())
    await session.generate_reply(instructions="Greet the user and ask for their name.")


# Start the agent
if __name__ == "__main__":
    agents.cli.run_app(server)
