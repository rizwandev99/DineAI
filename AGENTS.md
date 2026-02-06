# AGENTS.md - AI Assistant Instructions

> **READ FIRST:** Always read `.agent/context.md` for full project context.

## Project: DineAI
Voice AI restaurant booking assistant using LiveKit Agents.

## Tech Stack
- **Agent**: Python + LiveKit Agents 1.3.12
- **LLM**: Groq API (llama-3.3-70b-versatile)
- **STT/TTS**: Deepgram
- **VAD**: Silero
- **Backend**: Node.js/Express (port 3001)
- **Frontend**: React/Next.js (port 3000)

## Critical Pattern (LiveKit 1.3.12)
```python
# Use AgentServer pattern, NOT WorkerOptions
server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    session = AgentSession(stt=..., llm=..., tts=..., vad=...)
    await session.start(room=ctx.room, agent=MyAgent())

agents.cli.run_app(server)
```

## Key Files
- `agent/agent.py` - Voice agent entry point
- `backend/src/index.ts` - API server
- `.agent/context.md` - Full project context (ALWAYS READ THIS)

## Rules
1. Always read `.agent/context.md` at session start
2. Update `.agent/context.md` after significant changes
3. Use AgentServer pattern for LiveKit (NOT WorkerOptions)
4. ChatMessage.content must be a LIST, not string
