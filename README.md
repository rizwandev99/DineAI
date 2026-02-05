# 🍽️ DineAI - Restaurant Booking Voice Agent

An intelligent voice agent that helps users book restaurant tables through natural conversation, built with **LiveKit Agents Framework**.

![Voice Agent Demo](https://img.shields.io/badge/LiveKit-Voice%20Agent-orange)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## 🎯 Features

- **🎤 Voice Interaction**: Natural speech-to-text and text-to-speech using LiveKit
- **🤖 AI-Powered Conversations**: GPT-4 powered intelligent booking assistant
- **🌤️ Weather Integration**: Real-time weather forecast for seating suggestions
- **📅 Complete Booking Flow**: Guests, date/time, cuisine, special requests
- **💾 Persistent Storage**: MongoDB database for all bookings
- **🎨 Modern UI**: Beautiful React frontend with glassmorphism design

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [How It Works](#how-it-works)
- [Demo](#demo)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User's Browser                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    React Frontend                            │   │
│  │  - Voice interface with microphone button                    │   │
│  │  - Connects to LiveKit for real-time audio                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       LiveKit Cloud                                 │
│  - WebRTC audio/video transport                                     │
│  - Connects user to voice agent                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Voice Agent (Node.js)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ STT (Deepgram)│──│ LLM (GPT-4) │──│ TTS (Cartesia)│              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                           │                                         │
│              ┌────────────┼────────────┐                           │
│              ▼            ▼            ▼                           │
│        Weather Tool  Booking Tool  Get Booking                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Backend API (Express.js)                         │
│  - POST /api/bookings (Create booking)                              │
│  - GET /api/bookings (List bookings)                                │
│  - GET /api/bookings/:id (Get booking)                              │
│  - DELETE /api/bookings/:id (Cancel booking)                        │
│  - GET /api/weather (Get weather forecast)                          │
└─────────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌──────────────────────────┐   ┌─────────────────────────┐
│       MongoDB            │   │   OpenWeatherMap API    │
│   (Booking Storage)      │   │   (Weather Forecast)    │
└──────────────────────────┘   └─────────────────────────┘
```

## ✅ Prerequisites

Before you begin, make sure you have:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | >= 20.0.0 | `node --version` |
| npm | >= 9.0.0 | `npm --version` |
| **Python** | **>= 3.10** | **`python --version`** |
| MongoDB | >= 6.0 | `mongod --version` |

**Note:** The voice agent uses **Python** (LiveKit's mature framework), while the backend API uses **Node.js** (as required).

### Required API Keys (Free Tiers Available)

1. **LiveKit Cloud** - [Sign up here](https://cloud.livekit.io/)
   - Provides: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`

2. **OpenAI** - [Get API key](https://platform.openai.com/api-keys)
   - Provides: `OPENAI_API_KEY`

3. **OpenWeatherMap** - [Get API key](https://openweathermap.org/api)
   - Provides: `OPENWEATHER_API_KEY`

## 📁 Project Structure

```
DineAI/
├── agent/                    # LiveKit Voice Agent (Python)
│   ├── agent.py             # Main agent entry point
│   ├── requirements.txt     # Python dependencies
│   └── .env.local           # Environment variables
│
├── backend/                  # Express.js API Server
│   ├── src/
│   │   ├── index.ts         # Server entry point
│   │   ├── config/
│   │   │   └── database.ts  # MongoDB connection
│   │   ├── models/
│   │   │   └── Booking.ts   # Booking schema
│   │   ├── controllers/
│   │   │   ├── bookingController.ts
│   │   │   └── weatherController.ts
│   │   └── routes/
│   │       ├── bookingRoutes.ts
│   │       └── weatherRoutes.ts
│   ├── package.json
│   └── .env.example
│
├── frontend/                 # React Web App
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   └── VoiceAgent.tsx
│   │   └── index.css
│   ├── package.json
│   └── index.html
│
└── README.md
```

## 🚀 Setup Instructions

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd DineAI

# Install backend dependencies
cd backend
npm install

# Install agent dependencies (Python)
cd ../agent
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/dineai
OPENWEATHER_API_KEY=your_openweather_api_key_here
DEFAULT_LOCATION=Mumbai
```

#### Agent (.env.local)
```bash
cd agent
cp .env.example .env.local
```

Edit `agent/.env.local`:
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
OPENAI_API_KEY=your_openai_api_key
BACKEND_API_URL=http://localhost:3001
DEFAULT_LOCATION=Mumbai
```

### Step 3: Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env
```

## ▶️ Running the Application

Open **3 terminal windows**:

### Terminal 1: Backend API
```bash
cd backend
npm run dev
```
Server runs at: http://localhost:3001

### Terminal 2: Voice Agent
```bash
cd agent
python agent.py dev
```

### Terminal 3: Frontend (Optional)
```bash
cd frontend
npm run dev
```
Opens at: http://localhost:5173

### Testing the Voice Agent

1. Go to [LiveKit Agent Playground](https://agents-playground.livekit.io/)
2. Click **"Connect"**
3. Allow microphone access
4. Start talking! Try: *"I want to book a table for 4 people"*

## 📚 API Documentation

### Bookings API

#### Create Booking
```http
POST /api/bookings
Content-Type: application/json

{
  "customerName": "John Doe",
  "numberOfGuests": 4,
  "bookingDate": "2024-02-15",
  "bookingTime": "19:00",
  "cuisinePreference": "Italian",
  "specialRequests": "Anniversary celebration",
  "seatingPreference": "outdoor",
  "weatherInfo": {
    "condition": "Clear",
    "temperature": 25,
    "description": "clear sky"
  }
}
```

#### Get All Bookings
```http
GET /api/bookings
GET /api/bookings?status=confirmed
GET /api/bookings?date=2024-02-15
```

#### Get Single Booking
```http
GET /api/bookings/BK-A1B2C3D4
```

#### Cancel Booking
```http
DELETE /api/bookings/BK-A1B2C3D4
```

### Weather API

```http
GET /api/weather?date=2024-02-15&location=Mumbai
```

Response:
```json
{
  "success": true,
  "data": {
    "location": "Mumbai",
    "date": "2024-02-15",
    "weather": {
      "condition": "Clear",
      "temperature": 28,
      "description": "clear sky",
      "humidity": 65,
      "windSpeed": 3.5
    },
    "seatingSuggestion": {
      "recommendation": "outdoor",
      "reason": "Pleasant weather",
      "voiceResponse": "The weather looks lovely at 28°C! Would you prefer outdoor seating?"
    }
  }
}
```

## 🎯 How It Works

### Conversation Flow

1. **Greeting**: Agent welcomes user and asks for number of guests
2. **Date/Time**: Collects booking date and time
3. **Weather Check**: Fetches REAL weather data from OpenWeatherMap
4. **Seating Suggestion**: Recommends indoor/outdoor based on weather
5. **Cuisine**: Asks for cuisine preference
6. **Special Requests**: Optional birthday, anniversary, dietary needs
7. **Confirmation**: Creates booking and provides booking ID

### Key Technical Decisions

- **LiveKit for Voice**: Industry-standard WebRTC platform for reliable voice streaming
- **STT/LLM/TTS Pipeline**: Combines Deepgram, GPT-4, and Cartesia for low-latency voice
- **Tool Calling**: LLM uses function calling to interact with backend APIs
- **Weather from Backend**: Agent fetches weather from OUR API, not random LLM responses

## 🎬 Demo

To create a demo recording:

1. Start all servers (backend, agent, frontend)
2. Open LiveKit Playground
3. Record your screen while having a booking conversation
4. Show the booking being created in MongoDB

Example conversation:
- User: "I'd like to book a table"
- Agent: "Welcome! How many guests?"
- User: "4 people, tomorrow at 7pm"
- Agent: "The weather looks great at 25°C! Indoor or outdoor?"
- ...

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Voice Agent | LiveKit Agents, Node.js |
| Speech-to-Text | Deepgram (via LiveKit) |
| AI/LLM | OpenAI GPT-4 |
| Text-to-Speech | Cartesia (via LiveKit) |
| Backend API | Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| Weather API | OpenWeatherMap |
| Frontend | React, Vite, TypeScript |

## 📝 License

MIT License - feel free to use for your projects!

---

Built with ❤️ for the Vaiu AI Software Developer Internship Assignment
