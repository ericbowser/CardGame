import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client'
import '../style/output.css'
import App from './app.jsx';

createRoot(document.getElementById("root"))
    .render(
        <StrictMode>
            <App/>
        </StrictMode>
    );