import GameBoard from '../components/game/GameBoard';
import CounterTextBoard from '../components/game/CounterTextBoard';
import { isCounterTextMode } from '../utils/counterTextMode';

const App = () => {
    const textMode = isCounterTextMode();

    return (
        <div className="flex min-h-dvh flex-col bg-[#040404] md:h-dvh md:min-h-0 md:overflow-hidden">
            <main className="flex w-full flex-1 flex-col p-1 md:min-h-0 md:overflow-hidden">
                {textMode ? <CounterTextBoard /> : <GameBoard />}
            </main>
        </div>
    );
};

export default App;
