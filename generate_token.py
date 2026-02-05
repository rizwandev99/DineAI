#!/usr/bin/env python
"""
Generate a LiveKit room token for testing the voice agent
"""
import os
from dotenv import load_dotenv
from livekit import api

load_dotenv(dotenv_path="agent/.env.local")

# Get credentials from environment
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

# Generate token
room_name = "dineai-test-room"
participant_name = "test-user"

token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET) \
    .with_identity(participant_name) \
    .with_name(participant_name) \
    .with_grants(api.VideoGrants(
        room_join=True,
        room=room_name,
    ))

print("\n" + "="*60)
print("🎤 DineAI LiveKit Connection Details")
print("="*60)
print(f"\nLiveKit URL: {LIVEKIT_URL}")
print(f"Room Token: {token.to_jwt()}")
print(f"\nRoom Name: {room_name}")
print("\nCopy the URL and Token into LiveKit Playground (Manual tab)")
print("="*60 + "\n")
