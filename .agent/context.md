# DineAI Project Context

> **AI INSTRUCTIONS:**
> 1. **READ AT START:** Always read this file at the start of a session to understand the project state.
> 2. **UPDATE ON CHANGE:** If you make significant changes (architecture, config, patterns), YOU MUST UPDATE this file.
> 3. **KEEP CONCISE:** Keep information high-level and actionable. removing outdated info.

> **Last Updated:** 2026-02-05
> **Purpose:** Persistent context file for AI assistants to understand and remember project state.

---

## Project Overview
**DineAI** is a voice-enabled restaurant booking assistant powered by LiveKit Agents. Users can speak to the AI to book restaurant tables.

---

## Architecture

```
DineAI/
├── frontend/          # React/Next.js web UI
├── backend/           # Node.js Express API server
└── agent/             # Python LiveKit Voice Agent
```

### Components
| Component | Tech Stack | Port | Purpose |
|-----------|-----------|------|---------|
| Frontend | React/Next.js | 3000 | User interface |
| Backend | Node.js/Express | 3001 | REST API for bookings |
| Agent | Python/LiveKit | - | Voice AI assistant |

---

## Agent Configuration (Critical)

### SDK Version
- **livekit-agents**: `1.3.12`
- **Pattern**: Uses `AgentServer` + `@server.rtc_session()` decorator (NOT the old `WorkerOptions` pattern)

### Key File
- **Path**: `agent/agent.py`
- **Entry point**: `agents.cli.run_app(server)` where `server = AgentServer()`

### Agent Pattern (1.3.12)
```python
from livekit.agents import AgentServer, AgentSession, Agent

class DineAIAssistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="...")

server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    session = AgentSession(stt=..., llm=..., tts=..., vad=...)
    await session.start(room=ctx.room, agent=DineAIAssistant())
    await session.generate_reply(instructions="Greet the user...")

if __name__ == "__main__":
    agents.cli.run_app(server)
```

### Important Notes for ChatMessage
In SDK 1.3.12, `ChatMessage.content` must be a **LIST**, not a string:
```python
# WRONG
llm.ChatMessage(role="system", content="Hello")

# CORRECT
llm.ChatMessage(role="system", content=["Hello"])
```

---

## Environment Variables

### Agent (.env.local in agent/)
```
LIVEKIT_URL=wss://dineai-3d540k8b.livekit.cloud
LIVEKIT_API_KEY=<key>
LIVEKIT_API_SECRET=<secret>
GROQ_API_KEY=<key>
DEEPGRAM_API_KEY=<key>
BACKEND_API_URL=http://localhost:3001
```

### Backend (.env in backend/)
```
PORT=3001
```

---

## Running the Project

### Start All Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Agent
cd agent && python agent.py dev

# Terminal 3: Frontend
cd frontend && npm run dev
```

### Testing
- Open LiveKit Agents Playground: https://agents-playground.livekit.io/
- Connect to the room
- Agent should join and speak greeting

---

## Known Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Waiting for agent audio track..." | Wrong agent pattern | Use `AgentServer` + `@server.rtc_session()` |
| ValidationError for ChatMessage content | Content must be list | Use `content=[text]` not `content=text` |
| Agent not dispatching | Using old WorkerOptions | Migrate to AgentServer pattern |

---

## External Services
- **LiveKit Cloud**: wss://dineai-3d540k8b.livekit.cloud (Region: India South)
- **LLM**: Groq API (llama-3.3-70b-versatile)
- **STT/TTS**: Deepgram
- **VAD**: Silero

---

## Change Log

### 2026-02-05
- Migrated agent from old `WorkerOptions` pattern to new `AgentServer` + `@server.rtc_session()` pattern
- Fixed `ChatMessage.content` to be a list instead of string
- Agent successfully registering with LiveKit Cloud

---

## Assignment Requirements (Vaiu AI Internship)

### Use Case: Restaurant Booking Voice Agent
Build an intelligent voice agent that helps users book restaurant tables through natural conversation.

### Core Features Required
1. **Greet user** and understand booking intent
2. **Collect booking info via voice:**
   - Number of guests
   - Preferred date and time
   - Cuisine preference (Italian, Chinese, Indian, etc.)
   - Special requests (birthday, anniversary, dietary restrictions)
3. **Weather integration** - Fetch real-time weather for booking date, suggest indoor/outdoor seating
4. **Confirm booking** details via voice
5. **Store booking** in database

### Technical Requirements

#### Must Have
| Feature | Details |
|---------|---------|
| **Voice Interaction** | STT (user input) + TTS (agent responses), natural voice commands |
| **Backend API** | Node.js + Express RESTful endpoints |
| **Database** | MongoDB for bookings |
| **Weather API** | Real data from OpenWeatherMap/WeatherAPI (NOT random LLM responses) |

#### Backend Endpoints
```
POST   /api/bookings      # Create new booking
GET    /api/bookings      # Get all bookings
GET    /api/bookings/:id  # Get specific booking
DELETE /api/bookings/:id  # Cancel booking
```

#### Booking Schema
```javascript
{
  bookingId: String,
  customerName: String,
  numberOfGuests: Number,
  bookingDate: Date,
  bookingTime: String,
  cuisinePreference: String,
  specialRequests: String,
  weatherInfo: Object,
  seatingPreference: String,  // indoor/outdoor
  status: String,             // confirmed, pending, cancelled
  createdAt: Date
}
```

#### Weather Integration (Critical)
- **MUST fetch real data** from weather API
- Suggest seating based on weather:
  - Sunny → "Perfect weather for outdoor dining!"
  - Rainy → "Looks like rain. Indoor seating would be better."

### Deliverables Checklist
- [ ] Working voice agent (runs locally)
- [ ] Clean code with comments
- [ ] README with setup instructions
- [ ] Screen recording (2-3 min) demo

### Key Resources
- **LiveKit Agents**: https://docs.livekit.io/agents/
- **OpenWeatherMap**: https://openweathermap.org/api
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
