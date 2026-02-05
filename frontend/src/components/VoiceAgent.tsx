/**
 * VoiceAgent Component
 * 
 * What this component does:
 * - Provides the UI for connecting to the voice agent
 * - Displays connection status
 * - Shows instructions for connecting via LiveKit Playground
 * 
 * How it works:
 * 1. User clicks "Connect" button
 * 2. Opens LiveKit Agent Playground in a new tab
 * 3. User can speak to the voice agent there
 * 
 * For a full implementation:
 * - Would use @livekit/components-react to embed audio
 * - Connect directly to LiveKit room from this page
 */

import { useState } from 'react';

// Connection states
type ConnectionState = 'disconnected' | 'connecting' | 'connected';

function VoiceAgent() {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [showInstructions, setShowInstructions] = useState(true);

    /**
     * Open LiveKit Agent Playground
     * 
     * For the assignment, we use LiveKit's hosted playground.
     * This connects to the same agent we're running locally.
     */
    const handleConnect = () => {
        setConnectionState('connecting');

        // Open LiveKit Agents Playground
        window.open('https://agents-playground.livekit.io/', '_blank');

        // Reset state after a moment
        setTimeout(() => {
            setConnectionState('disconnected');
        }, 3000);
    };

    /**
     * Get button icon based on state
     */
    const getButtonIcon = () => {
        switch (connectionState) {
            case 'connecting':
                return '⏳';
            case 'connected':
                return '🔊';
            default:
                return '🎤';
        }
    };

    /**
     * Get status text based on state
     */
    const getStatusText = () => {
        switch (connectionState) {
            case 'connecting':
                return 'Opening playground...';
            case 'connected':
                return 'Connected - Speak now!';
            default:
                return 'Click to connect';
        }
    };

    return (
        <>
            <div className="voice-agent-card">
                <h2 className="agent-title">Book Your Table</h2>
                <p className="agent-description">
                    Speak naturally to book a restaurant table. I'll help you with date, time,
                    cuisine preferences, and even check the weather for seating suggestions!
                </p>

                <div className="mic-button-container">
                    <button
                        className={`mic-button ${connectionState}`}
                        onClick={handleConnect}
                        disabled={connectionState === 'connecting'}
                        aria-label="Connect to voice agent"
                    >
                        {getButtonIcon()}
                    </button>
                    <span className={`status-text ${connectionState === 'connected' ? 'active' : ''}`}>
                        {getStatusText()}
                    </span>
                </div>
            </div>

            {/* Instructions for connecting */}
            {showInstructions && (
                <div className="instructions">
                    <h3>📋 How to Test the Voice Agent</h3>
                    <ol>
                        <li>
                            First, start the <strong>backend server</strong>:
                            <br />
                            <code>cd backend && npm install && npm run dev</code>
                        </li>
                        <li>
                            Then, start the <strong>voice agent</strong>:
                            <br />
                            <code>cd agent && npm install && npm run dev</code>
                        </li>
                        <li>
                            Click the <strong>microphone button</strong> above to open LiveKit Playground
                        </li>
                        <li>
                            In the playground, click <strong>"Connect"</strong> and allow microphone access
                        </li>
                        <li>
                            Say: <em>"I want to book a table for 4 people tomorrow at 7pm"</em>
                        </li>
                    </ol>
                </div>
            )}

            {/* Sample Transcript (Demo) */}
            <div className="transcript-section">
                <div className="transcript-card">
                    <h3 className="transcript-title">Sample Conversation</h3>
                    <div className="transcript-content">
                        <div className="transcript-message agent">
                            Welcome to DineAI! I'd be happy to help you book a table. How many guests will be joining?
                        </div>
                        <div className="transcript-message user">
                            Hi! I'd like to book a table for 4 people.
                        </div>
                        <div className="transcript-message agent">
                            Perfect, a table for 4! What date would you like to come in?
                        </div>
                        <div className="transcript-message user">
                            Tomorrow evening, around 7pm.
                        </div>
                        <div className="transcript-message agent">
                            The weather looks lovely tomorrow at 24°C! Would you prefer outdoor seating on our beautiful patio?
                        </div>
                        <div className="transcript-message user">
                            Yes, outdoor sounds great!
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VoiceAgent;
