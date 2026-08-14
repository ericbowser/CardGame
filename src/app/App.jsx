import GameBoard from '../components/game/GameBoard';

const App = () => {
    return (
        <div className="flex min-h-screen flex-col bg-[#040404] lg:h-screen lg:overflow-hidden">
            <main className="flex w-full flex-1 flex-col overflow-y-auto px-2 py-2 lg:min-h-0 lg:overflow-hidden">
                <GameBoard />
            </main>

            <footer className="hidden shrink-0 py-2 text-center text-xs text-white/40 sm:block">
                © {new Date().getFullYear()} Blackjack — React & Three.js
            </footer>
        </div>
    );
};

export default App;
