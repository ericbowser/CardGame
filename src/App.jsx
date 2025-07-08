import React from 'react';
import Deck from "./components/Deck";
import '../style/output.css';
import {GameProvider} from "./GameContext";

const App = () => {
  return (
    <div className="min-h-screen bg-radial-green-yellow p-4">
      <header className="container mx-auto py-8 text-center">
        <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">Blackjack</h1>
        <p className="text-xl text-white opacity-80">Try your luck against the dealer!</p>
      </header>

      <main className="container mx-auto py-4">
        <GameProvider>
          <Deck />
        </GameProvider>
      </main>

      <footer className="container mx-auto mt-12 py-4 text-center text-white opacity-50 text-sm">
        <p>© {new Date().getFullYear()} Blackjack Card Game - Built with React & TailwindCSS</p>
      </footer>
    </div>
  );
};

export default App;