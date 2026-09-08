import { useGameContext } from '../../context';

function ShoeSettingsPanel() {
    const {
        deckCount,
        setDeckCount,
        deckCountOptions,
        shuffleDeck,
        boardBusy,
    } = useGameContext();

    return (
        <div className="space-y-3">
            <p className="text-sm leading-snug text-white/55">
                Pick a shoe size, then shuffle to start the session.
            </p>
            <div className="grid grid-cols-2 gap-2">
                {deckCountOptions.map((option) => (
                    <button
                        key={option}
                        type="button"
                        data-testid={`deck-count-${option}`}
                        onClick={() => setDeckCount(option)}
                        className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                            deckCount === option
                                ? 'bg-amber-500 text-black'
                                : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        {option} deck{option > 1 ? 's' : ''}
                    </button>
                ))}
            </div>
            <button
                type="button"
                data-testid="shuffle-deck"
                className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-40"
                disabled={boardBusy}
                onClick={shuffleDeck}
            >
                Shuffle shoe
            </button>
        </div>
    );
}

export default ShoeSettingsPanel;
