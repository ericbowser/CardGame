import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client'
import '../style/output.css'
import App from './App.jsx';
import GameProvider from "./GameContext";

createRoot(document.getElementById("root"))
    .render(
        <StrictMode>
            <GameProvider>
                <App/>
            </GameProvider>
        </StrictMode>
    );