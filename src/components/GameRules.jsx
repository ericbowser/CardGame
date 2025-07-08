import React, { useState } from 'react';

const GameRules = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="text-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded font-bold flex items-center"
      >
        Game Rules
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Blackjack Rules</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  X
                </button>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3>Objective</h3>
                <p>
                  The goal of blackjack is to beat the dealer's hand without going over 21.
                  Face cards are worth 10. Aces are worth 1 or 11, whichever makes a better hand.
                </p>

                <h3>How to Play</h3>
                <ol>
                  <li>Place your bet by selecting chips and clicking "Place Bet & Deal".</li>
                  <li>You and the dealer will each receive two cards.</li>
                  <li>One of the dealer's cards is hidden until the end of the round.</li>
                  <li>
                    You can choose to "Hit" (get another card) or "Stay" (end your turn).
                  </li>
                  <li>
                    If you go over 21, you "bust" and lose the round immediately.
                  </li>
                  <li>
                    When you stay, the dealer reveals their hidden card and must hit until
                    their hand is 17 or higher.
                  </li>
                  <li>
                    If the dealer busts, you win. Otherwise, the higher hand wins.
                  </li>
                </ol>

                <h3>Special Rules</h3>
                <ul>
                  <li>
                    <strong>Blackjack:</strong> If your first two cards are an Ace and a 10-value card,
                    you have a blackjack. This beats any hand except another blackjack.
                  </li>
                  <li>
                    <strong>Push:</strong> If your hand ties with the dealer's, it's a "push" and
                    your bet is returned.
                  </li>
                  <li>
                    <strong>Dealer Rules:</strong> The dealer must hit on 16 or less and stand on 17 or more.
                  </li>
                </ul>

                <h3>Card Values</h3>
                <ul>
                  <li>Number cards (2-10): Face value</li>
                  <li>Face cards (Jack, Queen, King): 10 points</li>
                  <li>Ace: 1 or 11 points (whichever is more advantageous)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRules;