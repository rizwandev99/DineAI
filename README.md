# 🍽️ DineAI - Restaurant Booking Voice Agent

An intelligent voice agent that helps users book restaurant tables through natural conversation, built with **LiveKit Agents Framework**.

![LiveKit](https://img.shields.io/badge/LiveKit-Agents%201.3-orange)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 🎤 **Voice Interaction** | Natural speech-to-text and text-to-speech |
| 🌤️ **Weather Integration** | Real-time weather forecast for seating suggestions |
| 📅 **Complete Booking Flow** | Name, guests, date/time, cuisine, special requests |
| 💾 **Database Storage** | MongoDB for persistent booking records |
| 🔧 **Function Calling** | LLM automatically calls APIs for weather & bookings |

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Browser  │────▶│  LiveKit Cloud   │────▶│  Voice Agent    │
│   (Microphone)  │◀────│  (WebRTC Audio)  │◀────│  (Python)       │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                        ┌─────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Voice Agent Pipeline                          │
│  ┌──────────┐    ┌────────────────┐    ┌──────────┐             │
│  │ Deepgram │───▶│ Groq LLM       │───▶│ Deepgram │             │
│  │ (STT)    │    │ (llama-3.3)    │    │ (TTS)    │             │
│  └──────────┘    └───────┬────────┘    └──────────┘             │
│                          │ Function Calls                        │
│              ┌───────────┴───────────┐                          │
│              ▼                       ▼                          │
│        get_weather()          create_booking()                  │
└──────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js/Express)                 │
│  POST /api/bookings  │  GET /api/bookings  │  GET /api/weather  │
└──────────────────────────────────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
┌──────────────────┐       ┌────────────────────┐
│  MongoDB Atlas   │       │  OpenWeatherMap    │
│  (Bookings DB)   │       │  (Weather API)     │
└──────────────────┘       └────────────────────┘
```

## ✅ Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Python | >= 3.10 | `python --version` |
| Node.js | >= 20.0 | `node --version` |
| npm | >= 9.0 | `npm --version` |

### Required API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| LiveKit Cloud | Voice infrastructure | [cloud.livekit.io](https://cloud.livekit.io/) |
| Groq | LLM (free, fast) | [console.groq.com](https://console.groq.com/) |
| Deepgram | STT/TTS | [deepgram.com](https://deepgram.com/) |
| OpenWeatherMap | Weather data | [openweathermap.org](https://openweathermap.org/api) |
| MongoDB Atlas | Database | [mongodb.com/atlas](https://www.mongodb.com/atlas) |

## 📁 Project Structure

```
DineAI/
├── agent/                    # Voice Agent (Python)
│   ├── agent.py             # Main agent with function tools
│   ├── requirements.txt     # Python dependencies
│   └── .env.local           # Agent environment variables
│
├── backend/                  # API Server (Node.js)
│   ├── src/
│   │   ├── index.ts         # Express server
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # MongoDB schemas
│   │   └── routes/          # API endpoints
│   └── .env                 # Backend environment variables
│
└── frontend/                 # React Web UI (optional)
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/DineAI.git
cd DineAI

# Backend
cd backend && npm install

# Agent
cd ../agent && pip install -r requirements.txt

# Frontend (optional)
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend (`backend/.env`):**
```env
PORT=3001
MONGODB_URI=mongodb+srv://YOUR_CONNECTION_STRING
OPENWEATHER_API_KEY=your_key_here
DEFAULT_LOCATION=Mumbai
```

**Agent (`agent/.env.local`):**
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
GROQ_API_KEY=your_groq_key
DEEPGRAM_API_KEY=your_deepgram_key
BACKEND_API_URL=http://localhost:3001
```

### 3. Run the Application

Open **3 terminals**:

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Agent
cd agent && python agent.py dev

# Terminal 3: Frontend (optional)
cd frontend && npm run dev
```

### 4. Test the Voice Agent

1. Go to [LiveKit Agents Playground](https://agents-playground.livekit.io/)
2. Click **Connect**
3. Allow microphone access
4. Start talking: *"Hi, I'd like to book a table"*

## 🎯 Booking Flow

```
1. Greeting    → Agent asks for your name
2. Guests      → "How many people?"
3. Date/Time   → "When would you like to dine?"
4. Weather     → Agent fetches REAL weather data
5. Seating     → "It's 28°C! Outdoor or indoor?"
6. Cuisine     → "What type of cuisine?"
7. Special     → "Any special requests?"
8. Confirm     → Agent summarizes all details
9. Book        → Creates booking, provides ID
```

## 📚 API Endpoints

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | List all bookings |
| GET | `/api/bookings/:id` | Get single booking |
| DELETE | `/api/bookings/:id` | Cancel booking |

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather?date=YYYY-MM-DD` | Get weather forecast |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Voice Agent | Python, LiveKit Agents 1.3.12 |
| LLM | Groq (llama-3.3-70b-versatile) |
| STT/TTS | Deepgram |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas |
| Weather | OpenWeatherMap API |

## 📝 Key Implementation Details

### Function Tools
The agent uses **LLM function calling** to interact with APIs:

```python
@function_tool()
async def get_weather(date: str, location: str = "Mumbai") -> str:
    """Fetch weather and get seating recommendation"""
    # Calls backend /api/weather endpoint
    
@function_tool()
async def create_booking(...) -> str:
    """Save booking to database"""
    # Calls backend POST /api/bookings
```

### Weather-Based Seating
- **Rain/Snow/Cold (<10°C)/Hot (>35°C)** → Recommend indoor
- **Clear/Pleasant weather** → Recommend outdoor

---

Built for the **Vaiu AI Software Developer Internship Assignment** 🚀
