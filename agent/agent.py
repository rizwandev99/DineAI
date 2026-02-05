import logging
import os
import asyncio

from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AgentServer, AgentSession, Agent, room_io
from livekit.plugins import openai, deepgram, silero
import aiohttp

load_dotenv(dotenv_path=".env.local")
logger = logging.getLogger("dineai-agent")
logging.basicConfig(level=logging.INFO)

# Backend API URL
BACKEND_URL = os.getenv("BACKEND_API_URL", "http://localhost:3001")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

async def fetch_weather(date: str) -> dict:
    """Fetch weather from backend"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BACKEND_URL}/api/weather", params={"date": date}) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("data", {})
    except Exception as e:
        logger.error(f"Weather error: {e}")
    return {}

async def create_booking_api(booking_data: dict) -> dict:
    """Create booking via backend"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BACKEND_URL}/api/bookings", json=booking_data) as response:
                if response.status in [200, 201]:
                    return await response.json()
    except Exception as e:
        logger.error(f"Booking error: {e}")
        return {"success": False, "error": str(e)}
    return {"success": False, "error": "Unknown error"}


# Define the DineAI Assistant Agent
class DineAIAssistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are DineAI, a friendly restaurant booking assistant.
Your goal: Help customers book tables by collecting:
1. Customer name
2. Number of guests
3. Date and time
4. Cuisine preference (Italian, Chinese, Indian, Mexican, Japanese, Thai, American)
5. Special requests (optional)
Rules:
- Ask ONE question at a time
- Keep responses SHORT (1-2 sentences)
- Be warm and professional
Start by greeting the user and asking for their name.""",
        )


# Create the AgentServer
server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    logger.info("DEBUG: RTC SESSION STARTED")
    logger.info(f"Room: {ctx.room.name}")
    
    # Check keys
    keys = {
        "GROQ_API_KEY": os.getenv("GROQ_API_KEY"),
        "DEEPGRAM_API_KEY": os.getenv("DEEPGRAM_API_KEY"),
    }
    for k, v in keys.items():
        if v:
            logger.info(f"Key present: {k} (Length: {len(v)})")
        else:
            logger.error(f"Missing key: {k}")

    # Initialize components
    vad = silero.VAD.load()
    logger.info("VAD Initialized")
    
    # Create AgentSession with Groq LLM via OpenAI-compatible API
    session = AgentSession(
        stt=deepgram.STT(),
        llm=openai.LLM(
            base_url="https://api.groq.com/openai/v1",
            api_key=GROQ_API_KEY,
            model="llama-3.3-70b-versatile"
        ),
        tts=deepgram.TTS(),
        vad=vad,
    )
    
    logger.info("Starting AgentSession...")
    await session.start(
        room=ctx.room,
        agent=DineAIAssistant(),
    )
    logger.info("AgentSession started!")
    
    # Generate initial greeting
    await session.generate_reply(
        instructions="Greet the user warmly as a restaurant host and ask for their name."
    )
    
    logger.info("✅ Agent started - listening for voice input")


if __name__ == "__main__":
    agents.cli.run_app(server)
