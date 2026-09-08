import { GameState } from '../../constants/game';

import { useGameContext } from '../../context';

import { getCounterWager } from '../../utils/counterBetSpread';

import {

    estimatePlayerEvPercent,

    formatEvPercent,

} from '../../utils/countingUtils';

import { countValueClass, evValueClass } from '../../utils/countDisplayStyles';



function VitalBettingStats() {

    const {

        playerChips,

        handResults,

        gameState,

        roundOver,

        trueCount,

        runningCount,

        cardsRemaining,

        isDeckShuffled,

    } = useGameContext();



    const lastRoundPnL =

        roundOver && handResults.length > 0

            ? handResults.reduce((sum, result) => sum + (result.amount ?? 0), 0)

            : null;



    const suggestedBet = isDeckShuffled

        ? getCounterWager(trueCount, playerChips, cardsRemaining)

        : 0;



    const evPercent = estimatePlayerEvPercent(trueCount);

    const pnlTone =

        lastRoundPnL == null

            ? 'text-white/40'

            : lastRoundPnL > 0

              ? 'text-emerald-300'

              : lastRoundPnL < 0

                ? 'text-red-300'

                : 'text-white/60';



    const inRound =

        gameState === GameState.PlayerPhase ||

        gameState === GameState.DealerPhase ||

        gameState === GameState.CardsDealt;



    return (

        <div className="space-y-3 text-sm">

            <div className="flex items-end justify-between gap-3">

                <div>

                    <div className="text-xs font-semibold uppercase tracking-wide text-white/45">Bankroll</div>

                    <div

                        className="text-3xl font-extrabold tabular-nums leading-none text-amber-300"

                        data-testid="player-chips"

                    >

                        ${playerChips}

                    </div>

                </div>

                <div className="text-right">

                    <div className="text-xs font-semibold uppercase tracking-wide text-white/45">

                        {inRound ? 'Live P&L' : 'Last hand'}

                    </div>

                    <div className={`text-xl font-bold tabular-nums ${pnlTone}`} data-testid="last-hand-pnl">

                        {lastRoundPnL == null

                            ? '—'

                            : `${lastRoundPnL >= 0 ? '+' : ''}$${lastRoundPnL}`}

                    </div>

                </div>

            </div>



            {isDeckShuffled && (

                <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3">

                    <div className="rounded-lg border border-white/10 bg-black/35 px-2 py-2">

                        <div className="text-[11px] uppercase text-white/45">True count</div>

                        <div

                            className={`text-lg font-extrabold tabular-nums ${countValueClass(trueCount)}`}

                            data-testid="true-count"

                        >

                            {trueCount > 0 ? `+${trueCount}` : trueCount}

                        </div>

                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/35 px-2 py-2">

                        <div className="text-[11px] uppercase text-white/45">Running</div>

                        <div

                            className={`text-lg font-extrabold tabular-nums ${countValueClass(runningCount)}`}

                            data-testid="running-count"

                        >

                            {runningCount > 0 ? `+${runningCount}` : runningCount}

                        </div>

                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/35 px-2 py-2">

                        <div className="text-[11px] uppercase text-white/45">EV</div>

                        <div className={`text-lg font-extrabold tabular-nums ${evValueClass(evPercent)}`}>

                            {formatEvPercent(evPercent)}

                        </div>

                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/35 px-2 py-2">

                        <div className="text-[11px] uppercase text-white/45">Bet · left</div>

                        <div className="text-lg font-extrabold tabular-nums text-amber-200">

                            ${suggestedBet}

                            <span className="ml-1 text-sm font-semibold text-white/45">{cardsRemaining}c</span>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}



export default VitalBettingStats;


