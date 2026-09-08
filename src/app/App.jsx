import GameBoard from '../components/game/GameBoard';
import CounterTextBoard from '../components/game/CounterTextBoard';
import { isCounterTextMode } from '../utils/counterTextMode';

const App = () => {
    const textMode = isCounterTextMode();

    return (
        <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#040404]">
            <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden p-1">
                {textMode ? <CounterTextBoard /> : <GameBoard />}
            </main>
        </div>
    );
};

export default App;
