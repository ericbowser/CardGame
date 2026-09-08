import React from 'react';
import Card from './Card';
import BettingSystem from './BettingSystem';
import VitalBettingStats from './VitalBettingStats';
import AiPlayerPanel from './AiPlayerPanel';
import ShoeSettingsPanel from './ShoeSettingsPanel';
import DeckTrackerPanel from './DeckTrackerPanel';
import GamePanel from '../layout/GamePanel';
import ResizableSidebar from '../layout/ResizableSidebar';
import { useGameContext } from '../../context';

const GameBoard = () => {
    const { isDeckShuffled, alertMessage } = useGameContext();

    const tableColumn = (
        <>
            {alertMessage && (
                <div className="mb-2 shrink-0 rounded-lg border border-amber-400/50 bg-amber-500/20 p-2 text-center text-sm font-bold text-amber-100 backdrop-blur-md">
                    {alertMessage}
                </div>
            )}
            <div className="min-h-0 flex-1">
                <Card />
            </div>
        </>
    );

    const settingsColumn = (
        <div className="flex flex-col gap-3 pb-2">
            <GamePanel title="Bankroll & count" testId="panel-bankroll">
                <VitalBettingStats />
            </GamePanel>

            {!isDeckShuffled && (
                <GamePanel title="Shoe setup" subtitle="Required before AI or manual play" testId="panel-shoe">
                    <ShoeSettingsPanel />
                </GamePanel>
            )}

            <GamePanel
                title="AI counter"
                subtitle="Watch perfect Hi-Lo play without Cypress"
                testId="panel-ai"
            >
                <AiPlayerPanel embedded />
            </GamePanel>

            {!isDeckShuffled && (
                <GamePanel title="Manual betting" testId="panel-betting">
                    <BettingSystem rail />
                </GamePanel>
            )}

            {isDeckShuffled && (
                <>
                    <GamePanel title="Betting" testId="panel-betting">
                        <BettingSystem rail />
                    </GamePanel>
                    <GamePanel title="Deck tracker" testId="panel-tracker">
                        <DeckTrackerPanel rail />
                    </GamePanel>
                </>
            )}
        </div>
    );

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <ResizableSidebar main={tableColumn} sidebar={settingsColumn} />
        </div>
    );
};

export default GameBoard;
