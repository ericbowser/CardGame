import React, { useState } from 'react';

const GameRules = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="text-mint-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-r from-mint-400 to-sage-400 hover:from-mint-500 hover:to-sage-500 px-4 py-3 rounded-xl font-bold flex items-center text-white shadow-mint transform hover:scale-105 transition-all duration-200 w-full justify-center"
            >
                📖 Game Rules
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-mint-lg max-w-3xl w-full max-h-screen overflow-y-auto border-2 border-mint-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-mint-700 flex items-center">
                                    🃏 Blackjack Rules
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-sage-500 hover:text-mint-700 text-3xl font-bold hover:bg-mint-100 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-6 text-sage-700">
                                <div className="bg-mint-50 rounded-xl p-6 border border-mint-200">
                                    <h3 className="text-xl font-bold text-mint-700 mb-3 flex items-center">
                                        🎯 Objective
                                    </h3>
                                    <p className="leading-relaxed">
                                        The goal of blackjack is to beat the dealer's hand without going over 21.
                                        Face cards (Jack, Queen, King) are worth 10 points. Aces are worth either 1 or 11 points,
                                        whichever makes a better hand for you.
                                    </p>
                                </div>

                                <div className="bg-sage-50 rounded-xl p-6 border border-sage-200">
                                    <h3 className="text-xl font-bold text-sage-700 mb-4 flex items-center">
                                        🎮 How to Play
                                    </h3>
                                    <ol className="space-y-2 list-none">
                                        <li className="flex items-start">
                                            <span className="bg-mint-200 text-mint-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                                            <span>Click "Deal Cards" to start a new round and receive your initial two cards.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-mint-200 text-mint-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                                            <span>You and the dealer will each receive two cards initially.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-mint-200 text-mint-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                                            <span>One of the dealer's cards is hidden (face down) until the end of the round.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-mint-200 text-mint-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                                            <span>Choose to "Hit" (get another card) or "Stay" (end your turn with current cards).</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-mint-200 text-mint-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">5</span>
                                            <span>If your hand total goes over 21, you "bust" and lose immediately.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-mint-200 text-mint-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">6</span>
                                            <span>When you stay, the dealer reveals their hidden card and draws until reaching 17 or higher.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="bg-mint-200 text-mint-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">7</span>
                                            <span>The hand closest to 21 without going over wins!</span>
                                        </li>
                                    </ol>
                                </div>

                                <div className="bg-cream-100 rounded-xl p-6 border border-cream-300">
                                    <h3 className="text-xl font-bold text-sage-700 mb-4 flex items-center">
                                        ✨ Special Rules
                                    </h3>
                                    <ul className="space-y-3 list-none">
                                        <li className="flex items-start">
                                            <span className="text-cream-500 text-xl mr-3">🃏</span>
                                            <div>
                                                <strong className="text-sage-800">Blackjack:</strong> If your first two cards are an Ace and a 10-value card,
                                                you have a blackjack! This beats any hand except another blackjack.
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-cream-500 text-xl mr-3">🤝</span>
                                            <div>
                                                <strong className="text-sage-800">Push:</strong> If your hand ties with the dealer's, it's a "push" and
                                                nobody wins.
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-cream-500 text-xl mr-3">🤖</span>
                                            <div>
                                                <strong className="text-sage-800">Dealer Rules:</strong> The dealer must hit on 16 or less and stand on 17 or more.
                                                The dealer has no choice in their actions.
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-mint-50 rounded-xl p-6 border border-mint-200">
                                    <h3 className="text-xl font-bold text-mint-700 mb-4 flex items-center">
                                        🔢 Card Values
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <ul className="space-y-2 list-none">
                                            <li className="flex items-center">
                                                <span className="bg-mint-200 text-mint-700 rounded-lg px-3 py-1 text-sm font-bold mr-3">2-10</span>
                                                <span>Face value (2 = 2 points, 10 = 10 points)</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="bg-sage-200 text-sage-700 rounded-lg px-3 py-1 text-sm font-bold mr-3">J Q K</span>
                                                <span>10 points each</span>
                                            </li>
                                        </ul>
                                        <ul className="space-y-2 list-none">
                                            <li className="flex items-center">
                                                <span className="bg-cream-300 text-sage-700 rounded-lg px-3 py-1 text-sm font-bold mr-3">ACE</span>
                                                <span>1 or 11 points (automatically best value)</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="text-center pt-4">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="bg-gradient-to-r from-mint-500 to-sage-500 hover:from-mint-600 hover:to-sage-600 px-8 py-3 rounded-xl text-white font-bold shadow-mint transform hover:scale-105 transition-all duration-200"
                                    >
                                        🎴 Got it! Let's Play
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameRules;