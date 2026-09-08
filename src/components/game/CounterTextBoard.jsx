import { GameState } from '../../constants/game';
import { HandStatus } from '../../constants/rules';
import { useGameContext } from '../../context';
import { getBasicStrategyAction } from '../../utils/basicStrategy';
import {
    describeAiBet,
    getCounterWager,
    shouldWongOut,
    spreadUnitsForTrueCount,
} from '../../utils/counterBetSpread';
import {
    estimatePlayerEvPercent,
    formatEvPercent,
    getBettingTrueCount,
    getCardShortName,
    getSpreadTrueCount,
} from '../../utils/countingUtils';
import { countBadgeClass, countStatCellClass, countValueClass, evValueClass } from '../../utils/countDisplayStyles';
import { getHandValue } from '../../utils/handUtils';
import BettingSystem from './BettingSystem';

function formatCards(cards, { holeIndex = -1, showHole = true } = {}) {
    if (!cards?.length) {
        return '—';
    }

    return cards
        .map((card, index) => {
            if (!showHole && holeIndex >= 0 && index === holeIndex) {
                return '🂠';
            }
            return getCardShortName(card);
        })
        .join('  ');
}

function StatCell({ label, value, testId, toneClass = 'text-white', countTone = false }) {
    const boxClass = countTone
        ? countStatCellClass(Number.parseFloat(String(value).replace(/[^\d.-]/g, '')) || 0)
        : 'border-white/10 bg-black/35';

    return (
        <div className={`rounded border px-2 py-1.5 ${boxClass}`}>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-white/45">{label}</div>
            <div className={`text-sm font-extrabold tabular-nums ${toneClass}`} data-testid={testId}>
                {value}
            </div>
        </div>
    );
}

function CounterTextBoard() {
    const {
        gameState,
        alertMessage,
        playerChips,
        playerHands,
        activeHandIndex,
        playerCountDisplay,
        dealerCards,
        dealerCount,
        showHoleCard,
        winner,
        roundOver,
        handResults,
        runningCount,
        trueCount,
        cardsRemaining,
        decksRemaining,
        penetration,
        cardsSeen,
        countEvents,
        currentBet,
        betAmount,
        isDeckShuffled,
        shuffleDeck,
        deckCount,
        setDeckCount,
        deckCountOptions,
        boardBusy,
        boardBusyMessage,
        canSplit,
        playerHit,
        playerStay,
        playerSplit,
        quickDeal,
        resetGame,
        deckWins,
        deckLosses,
        deckPushes,
        deckBlackjacks,
    } = useGameContext();

    const spreadTc = getSpreadTrueCount(runningCount, cardsRemaining);
    const bettingTc = getBettingTrueCount(runningCount, cardsRemaining);
    const spreadUnits = spreadUnitsForTrueCount(spreadTc);
    const suggestedBet = isDeckShuffled
        ? getCounterWager(trueCount, playerChips, cardsRemaining, runningCount)
        : 0;
    const wongOut = isDeckShuffled && shouldWongOut(runningCount, cardsRemaining);
    const evPercent = estimatePlayerEvPercent(trueCount);
    const betSummary = isDeckShuffled
        ? describeAiBet(trueCount, playerChips, cardsRemaining, runningCount)
        : null;

    const activeHand = playerHands[activeHandIndex] ?? null;
    const recommendedAction =
        gameState === GameState.PlayerPhase && activeHand
            ? getBasicStrategyAction({
                  playerCards: activeHand.cards,
                  dealerUpcard: dealerCards[0],
                  canSplit,
                  trueCount,
              })
            : null;

    const canPlayerAct = gameState === GameState.PlayerPhase;
    const isGameOver = gameState === GameState.GameConcluded;
    const isDealerTurn = gameState === GameState.DealerPhase;
    const canDealAgain = roundOver && betAmount > 0 && betAmount <= playerChips;

    const dealerDisplay = showHoleCard
        ? dealerCount
        : dealerCards[0]
          ? `${getHandValue({ cards: [dealerCards[0]] })} + ?`
          : '?';

    const lastRoundPnL =
        roundOver && handResults.length > 0
            ? handResults.reduce((sum, result) => sum + (result.amount ?? 0), 0)
            : null;

    return (
        <div
            className="flex h-full min-h-0 flex-1 flex-col gap-2 p-2 font-mono text-xs text-white"
            data-testid="counter-text-board"
        >
            <div
                className="shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2"
                data-testid="table-ready"
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <span className="text-[10px] uppercase tracking-widest text-emerald-300/70">
                            Counter text mode
                        </span>
                        <div className="text-lg font-bold text-white" data-testid="game-status">
                            {boardBusy ? boardBusyMessage || 'Busy…' : gameState ?? 'Ready'}
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-white/45">Bankroll </span>
                        <span className="text-2xl font-extrabold tabular-nums text-amber-300" data-testid="player-chips">
                            ${playerChips}
                        </span>
                        {lastRoundPnL != null && (
                            <div className="text-[10px] tabular-nums" data-testid="last-hand-pnl">
                                Last hand: {lastRoundPnL >= 0 ? '+' : ''}${lastRoundPnL}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {alertMessage && (
                <div className="shrink-0 rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-center font-bold text-amber-100">
                    {alertMessage}
                </div>
            )}

            <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
                <StatCell
                    label="Running count"
                    value={runningCount > 0 ? `+${runningCount}` : `${runningCount}`}
                    testId="running-count"
                    toneClass={countValueClass(runningCount)}
                    countTone
                />
                <StatCell
                    label="True count"
                    value={trueCount > 0 ? `+${trueCount}` : `${trueCount}`}
                    testId="true-count"
                    toneClass={countValueClass(trueCount)}
                    countTone
                />
                <StatCell
                    label="Spread TC"
                    value={spreadTc > 0 ? `+${spreadTc}` : `${spreadTc}`}
                    testId="spread-tc"
                    toneClass={countValueClass(spreadTc)}
                    countTone
                />
                <StatCell
                    label="Betting TC"
                    value={bettingTc > 0 ? `+${bettingTc.toFixed(1)}` : bettingTc.toFixed(1)}
                    testId="betting-tc"
                    toneClass={countValueClass(bettingTc)}
                    countTone
                />
                <StatCell
                    label="Player EV"
                    value={formatEvPercent(evPercent)}
                    testId="player-ev"
                    toneClass={evValueClass(evPercent)}
                    countTone
                />
                <StatCell
                    label="Penetration"
                    value={`${penetration}%`}
                    testId="penetration"
                />
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-4">
                <StatCell label="Cards left" value={`${cardsRemaining}`} testId="cards-remaining" />
                <StatCell label="Decks left" value={`${decksRemaining}`} testId="decks-remaining" />
                <StatCell label="Cards seen" value={`${cardsSeen}`} testId="cards-seen" />
                <StatCell label="Spread units" value={`${spreadUnits}u`} testId="spread-units" />
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-3">
                <StatCell
                    label="Suggested bet"
                    value={wongOut ? 'Wong out' : `$${suggestedBet}`}
                    testId="suggested-bet"
                    toneClass={wongOut ? 'text-red-300' : 'text-amber-300'}
                />
                <StatCell label="At risk" value={`$${currentBet}`} testId="current-bet" toneClass="text-emerald-300" />
                <StatCell
                    label="Strategy"
                    value={recommendedAction ?? '—'}
                    testId="recommended-action"
                    toneClass="text-cyan-300"
                />
            </div>

            {betSummary && (
                <div className="shrink-0 rounded border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-white/70" data-testid="bet-rationale">
                    {betSummary.label}
                </div>
            )}

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-[1fr_280px]">
                <div className="flex min-h-0 flex-col gap-2">
                    <div className="rounded-lg border border-white/10 bg-black/50 p-3" data-testid="table-canvas">
                        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                            Table
                        </div>

                        <div className="mb-3 rounded border border-white/10 bg-white/5 p-2" data-testid="dealer-hand">
                            <div className="mb-1 flex justify-between text-[10px] text-white/50">
                                <span>Dealer</span>
                                <span className="font-bold tabular-nums text-amber-100">{dealerDisplay}</span>
                            </div>
                            <div className="text-base font-bold tracking-wide text-white">
                                {formatCards(dealerCards, { holeIndex: 1, showHole: showHoleCard })}
                            </div>
                        </div>

                        {playerHands.map((hand, index) => (
                            <div
                                key={hand.id}
                                className={`mb-2 rounded border p-2 ${
                                    index === activeHandIndex && canPlayerAct
                                        ? 'border-cyan-400/50 bg-cyan-950/30'
                                        : 'border-white/10 bg-white/5'
                                }`}
                                data-testid={`player-hand-${index}`}
                            >
                                <div className="mb-1 flex justify-between text-[10px] text-white/50">
                                    <span>
                                        Player {playerHands.length > 1 ? `#${index + 1}` : ''}
                                        {hand.status !== HandStatus.Playing ? ` · ${hand.status}` : ''}
                                    </span>
                                    <span className="font-bold tabular-nums text-emerald-100">
                                        {getHandValue(hand)} · ${hand.bet}
                                    </span>
                                </div>
                                <div className="text-base font-bold tracking-wide text-white">
                                    {formatCards(hand.cards)}
                                </div>
                            </div>
                        ))}

                        {!playerHands.some((h) => h.cards.length) && dealerCards.length === 0 && (
                            <p className="text-center text-white/40">No cards dealt yet.</p>
                        )}

                        {isDealerTurn && (
                            <p className="mt-2 text-center text-amber-200">Dealer drawing…</p>
                        )}

                        {isGameOver && winner && (
                            <p className="mt-2 text-center font-bold text-amber-200" data-testid="round-result">
                                Result: {winner}
                                {handResults.length > 0 &&
                                    ` (${handResults.map((r) => r.outcome).join(', ')})`}
                            </p>
                        )}
                    </div>

                    {canPlayerAct && (
                        <div className="flex shrink-0 gap-2">
                            <button
                                type="button"
                                data-testid="hit"
                                disabled={boardBusy}
                                onClick={playerHit}
                                className="flex-1 rounded-lg bg-white/15 py-2 font-bold hover:bg-white/25 disabled:opacity-40"
                            >
                                Hit
                            </button>
                            <button
                                type="button"
                                data-testid="stand"
                                disabled={boardBusy}
                                onClick={playerStay}
                                className="flex-1 rounded-lg bg-amber-500 py-2 font-bold text-black hover:bg-amber-400 disabled:opacity-40"
                            >
                                Stay
                            </button>
                            <button
                                type="button"
                                data-testid="split"
                                disabled={!canSplit || boardBusy}
                                onClick={playerSplit}
                                className="flex-1 rounded-lg bg-violet-600 py-2 font-bold hover:bg-violet-500 disabled:opacity-40"
                            >
                                Split
                            </button>
                        </div>
                    )}

                    {isGameOver && canDealAgain && (
                        <button
                            type="button"
                            data-testid="deal-again"
                            disabled={boardBusy}
                            onClick={quickDeal}
                            className="shrink-0 rounded-lg bg-emerald-600 py-2 font-bold hover:bg-emerald-500 disabled:opacity-40"
                        >
                            Deal Again (${betAmount})
                        </button>
                    )}

                    <div
                        className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10 bg-black/60 p-2"
                        data-testid="count-event-log"
                    >
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                            Count feed
                        </div>
                        {countEvents.length === 0 ? (
                            <p className="text-white/35">Count updates appear here as cards are seen.</p>
                        ) : (
                            <ul className="space-y-1">
                                {[...countEvents].reverse().map((event) => (
                                    <li
                                        key={event.id}
                                        className={`flex items-center justify-between gap-2 rounded border px-2 py-1 text-[10px] ${countBadgeClass(event.delta)}`}
                                    >
                                        <span>{event.label}</span>
                                        <span className="font-bold">{event.cardName}</span>
                                        <span className="tabular-nums">
                                            {event.delta > 0 ? `+${event.delta}` : event.delta} → RC{' '}
                                            {event.runningCount > 0 ? `+${event.runningCount}` : event.runningCount}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <aside className="flex shrink-0 flex-col gap-2 overflow-y-auto">
                    <div className="rounded-md border border-white/10 bg-black/50 px-2 py-1.5 text-[10px]">
                        <div className="mb-1 font-bold uppercase tracking-wide text-white/45">Session</div>
                        <div className="grid grid-cols-2 gap-1 tabular-nums">
                            <span>W {deckWins}</span>
                            <span>L {deckLosses}</span>
                            <span>P {deckPushes}</span>
                            <span>BJ {deckBlackjacks}</span>
                        </div>
                        <div className="mt-1 border-t border-white/10 pt-1 text-white/60">
                            <span data-testid="player-score">
                                Player: {playerCountDisplay || '—'}
                            </span>
                        </div>
                    </div>

                    {!isDeckShuffled && (
                        <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5">
                            <div className="mb-1 text-[9px] font-bold text-white/50">Shoe</div>
                            <div className="mb-1 grid grid-cols-2 gap-0.5">
                                {deckCountOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        data-testid={`deck-count-${option}`}
                                        onClick={() => setDeckCount(option)}
                                        className={`rounded px-1 py-1 text-[9px] font-bold transition ${
                                            deckCount === option
                                                ? 'bg-amber-500 text-black'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                    >
                                        {option}D
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                data-testid="shuffle-deck"
                                className="w-full rounded bg-amber-500 py-1 text-[9px] font-bold text-black hover:bg-amber-400 disabled:opacity-40"
                                disabled={boardBusy}
                                onClick={shuffleDeck}
                            >
                                Shuffle
                            </button>
                        </div>
                    )}

                    <BettingSystem compact />

                    <button
                        type="button"
                        data-testid="reset-game"
                        onClick={resetGame}
                        className="rounded border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-white/50 hover:text-white/80"
                    >
                        Reset game
                    </button>
                </aside>
            </div>
        </div>
    );
}

export default CounterTextBoard;
