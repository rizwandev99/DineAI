/**
 * DineAI Main App Component
 * 
 * This is the root component that contains:
 * - Header with logo
 * - Voice agent interface
 * - Feature highlights
 * - Footer
 */

import { useState } from 'react';
import VoiceAgent from './components/VoiceAgent';

function App() {
    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="logo">
                    <span className="logo-icon">🍽️</span>
                    <div>
                        <h1 className="logo-text">DineAI</h1>
                        <p className="logo-subtitle">Voice-Powered Restaurant Booking</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                {/* Voice Agent Card */}
                <VoiceAgent />

                {/* Features */}
                <div className="features">
                    <div className="feature-card">
                        <div className="feature-icon">🎤</div>
                        <h3 className="feature-title">Voice Booking</h3>
                        <p className="feature-description">Book tables naturally with your voice</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🌤️</div>
                        <h3 className="feature-title">Weather Aware</h3>
                        <p className="feature-description">Smart indoor/outdoor suggestions</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🍕</div>
                        <h3 className="feature-title">Cuisine Choice</h3>
                        <p className="feature-description">Italian, Chinese, Indian & more</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">✨</div>
                        <h3 className="feature-title">Special Requests</h3>
                        <p className="feature-description">Birthdays, anniversaries, dietary needs</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>DineAI © 2024 - Built with LiveKit Voice Agent</p>
            </footer>
        </div>
    );
}

export default App;
