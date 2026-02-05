
try:
    from livekit.agents.voice import Agent, AgentSession
    print("Imports successful")
    print(f"Agent: {Agent}")
    print(f"AgentSession: {AgentSession}")
except ImportError as e:
    print(f"Import failed: {e}")
import livekit.agents
print(f"livekit.agents version: {livekit.agents.__version__}")
