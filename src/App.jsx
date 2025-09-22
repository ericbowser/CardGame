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

            <div className="bg-radial-green-yellow p-4">
                <header className="mx-auto py-8 text-center">
                    <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">Blackjack</h1>
                    <p className="text-xl text-white opacity-80">Try your luck against the dealer!</p>
                </header>

                <main className="container mx-auto py-4">
                    <GameBoard/>
                </main>

                <footer className="container mx-auto mt-12 py-4 text-center text-white opacity-50 text-sm">
                    <p>© {new Date().getFullYear()} Blackjack Card Game - Built with React & TailwindCSS</p>
                </footer>
            </div>
        </Wrapper>
    );
};

export default App;