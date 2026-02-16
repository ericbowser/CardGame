import React from 'react';
import GameBoard from "../components/GameBoard";
import '../style/output.css';
import styled from 'styled-components';

const Wrapper = styled.div`
    margin: 0 15% 25% 25%;
`;

const App = () => {
    return (
        <Wrapper>

            <div className="bg-felt-table p-4 min-h-screen">
                <header className="mx-auto py-8 text-center">
                    <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-2xl" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)'}}>Blackjack</h1>
                    <p className="text-xl text-white font-semibold drop-shadow-lg" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>Try your luck against the dealer!</p>
                </header>

                <main className="container mx-auto py-4">
                    <GameBoard/>
                </main>

                <footer className="container mx-auto mt-12 py-4 text-center text-white opacity-75 text-sm drop-shadow" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                    <p>© {new Date().getFullYear()} Blackjack Card Game - Built with React & TailwindCSS</p>
                </footer>
            </div>
        </Wrapper>
    );
};

export default App;