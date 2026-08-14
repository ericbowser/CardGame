import GameBoard from '../components/game/GameBoard';

const App = () => {
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[#040404]">
            <main className="flex min-h-0 w-full flex-1 flex-col px-2 py-2">
                <GameBoard />
            </main>

            <footer className="shrink-0 py-2 text-center text-xs text-white/40">
                © {new Date().getFullYear()} Blackjack — React & Three.js
            </footer>
        </div>
    );
};

export default App;
