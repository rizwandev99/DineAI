# 🍽️ DineAI - Restaurant Booking Voice Agent

A voice agent that helps users book restaurant tables through natural conversation.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)

## Features

- 🎤 Voice conversation using LiveKit
- 🌤️ Weather-based seating suggestions
- 📅 Complete booking flow
- 💾 MongoDB storage

## Project Structure

```
DineAI/
├── agent/           # Voice Agent (Python)
│   ├── agent.py
│   ├── requirements.txt
│   └── .env.local
│
└── backend/         # API Server (Node.js)
    ├── src/
    │   ├── index.ts
    │   ├── controllers/
    │   ├── models/
    │   └── routes/
    └── .env
```

## Quick Start

### 1. Install

```bash
# Backend
cd backend && npm install

# Agent
cd ../agent
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Configure

**Backend (`backend/.env`):**
```env
PORT=3001
MONGODB_URI=mongodb+srv://YOUR_CONNECTION_STRING
OPENWEATHER_API_KEY=your_key
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

### 3. Run

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Agent (with venv activated)
cd agent
venv\Scripts\activate
python agent.py dev
```

### 4. Test

1. Go to [LiveKit Playground](https://agents-playground.livekit.io/)
2. Click **Connect**
3. Talk: *"Hi, I'd like to book a table"*

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | List all bookings |
| GET | `/api/bookings/:id` | Get booking |
| DELETE | `/api/bookings/:id` | Cancel booking |
| GET | `/api/weather?date=YYYY-MM-DD` | Get weather |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Voice Agent | Python, LiveKit Agents |
| LLM | Groq (llama-3.3-70b) |
| STT/TTS | Deepgram |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas |
| Weather | OpenWeatherMap API |

---

