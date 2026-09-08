import { GameState } from '../constants/game';
import { getBasicStrategyAction } from '../utils/basicStrategy';
import { getCounterWager, getCounterGoal } from '../utils/counterBetSpread';

export function buildHandSignature(state) {
    if (!state) {
        return '';
    }

    const player = (state.playerHands ?? [])
        .map((hand, index) => `${index}:${hand.cards?.length ?? 0}:${hand.status ?? ''}`)
        .join('|');

    return [
        state.gameState ?? 'null',
        `epoch:${state.dealEpoch ?? 0}`,
        `d:${state.dealerCards?.length ?? 0}`,
        `hole:${state.showHoleCard ? 1 : 0}`,
        `p:${player}`,
        `i:${state.activeHandIndex ?? 0}`,
        state.boardBusy ? 'busy' : 'idle',
    ].join(';');
}

export function attachE2eBridge(stateRef) {
    const api = {
        getSnapshot: () => {
            const state = stateRef.current;
            const activeHand = state.playerHands[state.activeHandIndex] ?? null;
            const dealerUpcard = state.dealerCards[0] ?? null;

            return {
                gameState: state.gameState,
                boardBusy: state.boardBusy,
                playerChips: state.playerChips,
                betAmount: state.betAmount,
                runningCount: state.runningCount,
                trueCount: state.trueCount,
                cardsRemaining: state.cardsRemaining,
                playerHands: state.playerHands,
                activeHandIndex: state.activeHandIndex,
                activeHand,
                dealerCards: state.dealerCards,
                dealerUpcard,
                canSplit: state.canSplit,
                roundOver: state.roundOver,
                isDeckShuffled: state.isDeckShuffled,
                dealEpoch: state.dealEpoch,
                showHoleCard: state.showHoleCard,
                deckReady: Boolean(stateRef.current.isDeckReady?.()),
            };
        },
        getHandSignature: () => buildHandSignature(stateRef.current),
        getRecommendedBet: () => {
            const state = stateRef.current;
            return getCounterWager(
                state.trueCount,
                state.playerChips,
                state.cardsRemaining,
                state.runningCount,
            );
        },
        getRecommendedAction: () => {
            const state = stateRef.current;
            const hand = state.playerHands[state.activeHandIndex];
            if (!hand || state.gameState !== GameState.PlayerPhase) {
                return null;
            }

            return getBasicStrategyAction({
                playerCards: hand.cards,
                dealerUpcard: state.dealerCards[0],
                canSplit: state.canSplit,
                trueCount: state.trueCount,
            });
        },
        getGoal: () => getCounterGoal(stateRef.current.startingChips),
        /** Wong out — fresh shoe (count reset). Works mid-session when UI shuffle is hidden. */
        reshuffleShoe: () => {
            stateRef.current.shuffleDeck?.();
        },
        setBet: (amount) => {
            stateRef.current.setBetAmount?.(amount);
        },
        isDeckReady: () => Boolean(stateRef.current.isDeckReady?.()),
    };

    window.__BLACKJACK__ = api;
    return () => {
        delete window.__BLACKJACK__;
    };
}
