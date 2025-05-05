// src/App.jsx
import React from 'react';
import { GameProvider } from './GameContext';
import GameBoard from '../components/GameBoard';
import '../style/output.css';

const App = () => {
  return (
    <div className="min-h-screen bg-radial-green-yellow p-4">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">Blackjack</h1>
        <p className="text-white text-lg">Try your luck against the dealer!</p>
      </header>

      <GameProvider>
        <GameBoard />
      </GameProvider>

      <footer className="mt-8 text-center text-white text-sm opacity-70">
        <p>© 2025 Blackjack Game | Developed by You</p>
      </footer>
    </div>
  );
};

export default App;