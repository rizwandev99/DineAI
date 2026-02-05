/**
 * Main Entry Point for React App
 * 
 * This file:
 * 1. Sets up React
 * 2. Renders the App component into the DOM
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Find the root element in index.html and render our app
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
