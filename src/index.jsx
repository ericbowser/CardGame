import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../style/output.css';
import App from './app/App';
import { GameProvider } from './context';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GameProvider>
            <App />
        </GameProvider>
    </StrictMode>
);
