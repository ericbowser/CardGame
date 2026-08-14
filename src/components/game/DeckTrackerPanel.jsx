import { useGameContext } from '../../context';
import { formatCountDelta } from '../../utils/countingUtils';
import { countBadgeClass, countStatCellClass, countValueClass } from '../../utils/countDisplayStyles';

function CountBadge({ delta }) {
    return (
        <span className={`inline-flex min-w-[2rem] justify-center rounded-md border px-2 py-0.5 text-xs font-bold ${countBadgeClass(delta)}`}>
            {formatCountDelta(delta)}
        </span>
    );
}

function DeckTrackerPanel() {
    const {
        deckCount,
        totalCardsInShoe,
        cardsRemaining,
        decksRemaining,
        penetration,
        runningCount,
        trueCount,
        countEvents,
        isDeckShuffled,
        deckWins,
        deckLosses,
        deckPushes,
        deckBlackjacks,
    } = useGameContext();

    const runningCountClass = countValueClass(runningCount);
    const trueCountClass = countValueClass(trueCount);

    return (
        <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:p-5 lg:min-h-0 lg:flex-1">
            <h2 className="mb-3 shrink-0 text-lg font-bold text-white sm:mb-4 sm:text-xl">Deck Tracker</h2>

            {!isDeckShuffled ? (
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
                    Choose a shoe size and shuffle to begin tracking cards with Hi-Lo (+1 / 0 / -1).
                </div>
            ) : (
                <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
                    <div className="grid shrink-0 grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl border border-white/10 bg-black/35 p-3">
                            <div className="text-white/55">Shoe</div>
                            <div className="mt-1 text-lg font-bold text-white">
                                {deckCount}-deck ({totalCardsInShoe} cards)
                            </div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/35 p-3">
                            <div className="text-white/55">Cards left</div>
                            <div className="mt-1 text-lg font-bold text-white">
                                {cardsRemaining}
                                <span className="ml-1 text-sm font-medium text-white/50">
                                    ({decksRemaining} decks)
                                </span>
                            </div>
                        </div>
                        <div className={`rounded-xl border p-3 ${countStatCellClass(runningCount)}`}>
                            <div className="text-white/70">Running count</div>
                            <div className={`mt-1 text-2xl font-extrabold ${runningCountClass}`}>
                                {runningCount > 0 ? `+${runningCount}` : runningCount}
                            </div>
                        </div>
                        <div className={`rounded-xl border p-3 ${countStatCellClass(trueCount)}`}>
                            <div className="text-white/70">True count</div>
                            <div className={`mt-1 text-2xl font-extrabold ${trueCountClass}`}>
                                {trueCount > 0 ? `+${trueCount}` : trueCount}
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 rounded-xl border border-white/10 bg-black/35 p-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-white/55">Penetration</span>
                            <span className="font-bold text-white">{penetration}%</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full rounded-full bg-amber-400 transition-all"
                                style={{ width: `${penetration}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex max-h-48 flex-col rounded-xl border border-white/10 bg-black/35 p-3 lg:max-h-none lg:min-h-0 lg:flex-1">
                        <h3 className="mb-2 shrink-0 text-sm font-bold text-white/90">Count activity</h3>
                        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                            {countEvents.length === 0 ? (
                                <p className="text-xs italic text-white/45">Cards will update the count as they appear.</p>
                            ) : (
                                countEvents.slice().reverse().map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs"
                                    >
                                        <div className="min-w-0">
                                            <span className={`font-semibold ${countValueClass(event.delta)}`}>
                                                {event.cardName}
                                            </span>
                                            <span className="text-white/45"> · {event.label}</span>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <CountBadge delta={event.delta} />
                                            <span className={`font-bold ${countValueClass(event.runningCount)}`}>
                                                {event.runningCount > 0 ? `+${event.runningCount}` : event.runningCount}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 rounded-xl border border-white/10 bg-black/35 p-3">
                        <h3 className="mb-2 text-sm font-bold text-white/90">This shoe</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div className="text-white/55">Wins</div>
                            <div className="text-right font-bold text-white">{deckWins}</div>
                            <div className="text-white/55">Losses</div>
                            <div className="text-right font-bold text-white">{deckLosses}</div>
                            <div className="text-white/55">Pushes</div>
                            <div className="text-right font-bold text-white">{deckPushes}</div>
                            <div className="text-white/55">Blackjacks</div>
                            <div className="text-right font-bold text-white">{deckBlackjacks}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeckTrackerPanel;
