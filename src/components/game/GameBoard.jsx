import React from 'react';
import Card from './Card';
import BettingSystem from './BettingSystem';
import VitalBettingStats from './VitalBettingStats';
import AiPlayerPanel from './AiPlayerPanel';
import AiGlancePanel from './AiGlancePanel';
import TopGameStats from './TopGameStats';
import ShoeSettingsPanel from './ShoeSettingsPanel';
import DeckTrackerPanel from './DeckTrackerPanel';
import GamePanel from '../layout/GamePanel';
import ResizableSidebar from '../layout/ResizableSidebar';
import { useGameContext } from '../../context';

const GameBoard = () => {
    const { isDeckShuffled, alertMessage, aiPlayerEnabled } = useGameContext();

    // Mobile-only: hand totals sit above the felt in their own panel (not over the cards).
    const aboveBoard = isDeckShuffled ? (
        <GamePanel title="Hand status" testId="panel-hand-status">
            <TopGameStats showReset />
        </GamePanel>
    ) : null;

    const tableColumn = (
        <>
            {alertMessage && (
                <div className="mb-2 shrink-0 rounded-lg border border-amber-400/50 bg-amber-500/20 p-2 text-center text-sm font-bold text-amber-100 backdrop-blur-md">
                    {alertMessage}
                </div>
            )}
            <div className="game-board-canvas min-h-0 flex-1">
                <Card />
            </div>
        </>
    );

    // Mobile: sits directly under the board (CSS). Desktop: hidden — betting is in the rail.
    const underBoard = (
        <div className="flex flex-col gap-2">
            {!isDeckShuffled && (
                <GamePanel title="Shoe setup" subtitle="Required before play" testId="panel-shoe-mobile">
                    <ShoeSettingsPanel />
                </GamePanel>
            )}
            <GamePanel
                title={isDeckShuffled ? 'Betting' : 'Manual betting'}
                testId="panel-betting-mobile"
            >
                <BettingSystem rail />
            </GamePanel>
        </div>
    );

    // Priority on mobile: bankroll → tracker → AI last (one-time toggle).
    const settingsColumn = (
        <div className="flex flex-col gap-3 pb-2">
            <GamePanel title="Bankroll & count" testId="panel-bankroll">
                <VitalBettingStats />
            </GamePanel>

            {!isDeckShuffled && (
                <div className="hidden md:block">
                    <GamePanel title="Shoe setup" subtitle="Required before AI or manual play" testId="panel-shoe">
                        <ShoeSettingsPanel />
                    </GamePanel>
                </div>
            )}

            <div className="hidden md:block">
                <GamePanel
                    title={isDeckShuffled ? 'Betting' : 'Manual betting'}
                    testId="panel-betting"
                >
                    <BettingSystem rail />
                </GamePanel>
            </div>

            {isDeckShuffled && (
                <GamePanel title="Deck tracker" testId="panel-tracker">
                    <DeckTrackerPanel rail />
                </GamePanel>
            )}

            <GamePanel
                title="AI counter"
                subtitle="One-time toggle — leave on while you watch"
                testId="panel-ai"
            >
                <AiPlayerPanel embedded />
            </GamePanel>
        </div>
    );

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col md:min-h-0">
            <ResizableSidebar
                main={tableColumn}
                aboveBoard={aboveBoard}
                underBoard={underBoard}
                glance={aiPlayerEnabled ? <AiGlancePanel /> : null}
                sidebar={settingsColumn}
            />
        </div>
    );
};

export default GameBoard;
