// src/App.jsx - Complete replacement for your existing file
import React from 'react';
import { GameProvider } from './GameContext';
import GameBoard from './components/GameBoard';
import '../style/output.css';

/**
 * Main App component that establishes the context provider
 *
 * The key change here is wrapping everything in GameProvider.
 * This makes all our centralized state available to every component
 * in the application tree. Think of this as installing the "nervous system"
 * that allows all parts of your app to communicate.
 *
 * This pattern is called "Lifting State Up" - we've moved all state
 * to the highest level where it can be shared by all components that need it.
 */
const App = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-radial-green-yellow p-4">
        <header className="container mx-auto py-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Professional Blackjack
          </h1>
          <p className="text-xl text-white opacity-80">
            Master the game with strategy assistance and perfect odds
          </p>
        </header>

        <main className="container mx-auto py-4">
          {/* GameBoard replaces your original Deck component */}
          <GameBoard />
        </main>

        <footer className="container mx-auto mt-12 py-4 text-center text-white opacity-50 text-sm">
          <p>© {new Date().getFullYear()} Professional Blackjack - Built with React & TailwindCSS</p>
        </footer>
      </div>
    </GameProvider>
  );
};

export default App;