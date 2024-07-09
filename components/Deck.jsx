import React, {useEffect, useState} from 'react';
import Card from "./Card";
import useGameLog from "./GameLog";
import {GameState} from "../src/Utils";

const Deck = () => {
    const [deck, setDeck] = useState([]);
    const [shuffledDeck, setShuffledDeck] = useState([]);
    const [isDeckShuffled, setIsDeckShuffled] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [gameState, setGameState] = useState(null);

    const {logs, addLog, clearLogs} = useGameLog([]);

    const importAllImages = async () => {
        const modulePaths = import.meta.glob('../src/assets/images/*.{png,jpg,jpeg,js}');
        const imagePromises = Object.keys(modulePaths).map((path) => modulePaths[path]());

        // Resolve all promises to get the actual image paths
        return await Promise.all(imagePromises);
    };

    const getImages = async () => {
        await importAllImages()
            .then(images => {
                setDeck(images);
            });
    }

    useEffect(() => {
        if (alertMessage) {
            setGameState(GameState.GameConcluded);
        }
        if (gameState) {
            addLog(gameState);
        }
    }, [alertMessage, gameState])

    useEffect(() => {
        if (deck?.length === 0) {
            getImages().then(r => console.log('Importing assets...'));
        }
    }, [deck]);

    useEffect(() => {
        if (isDeckShuffled) {
            addLog('Deck Shuffled');
        }
        if (!isDeckShuffled && deck?.length > 0) {
            shuffleDeck();
        }
    }, [isDeckShuffled, shuffledDeck]);

    const shuffleDeck = () => {
        let obj = [];
        for (let i = deck?.length - 1; i >= 0; i--) {
            console.log(`card ${i} of original deck`)
            const j = Math.floor(Math.random() * (i + 1));

            [deck[i], deck[j]] = [deck[j], deck[i]];

            obj.push(deck[i].default);
        }

        if (obj.length === 52) {
            setShuffledDeck(obj);
            setIsDeckShuffled(true);
        }
    }

    function clearBoardState() {
        setDeck([]);
        setShuffledDeck([]);
        setIsDeckShuffled(false);
        setGameState(null);
        setAlertMessage(null);
        clearLogs();
    }

    return (
        <div>

            <div className={'container-sm m-20'}>

                <div className={'flex'}>
                    <div>
                        <button
                            className={'p-2 m-2 bg-black text-white rounded cursor-pointer text-center justify-center'}
                            style={{lineHeight: '1rem'}}
                            onClick={shuffleDeck}>
                            Shuffle and Deal
                        </button>
                        <button
                            className={'p-2 m-2 bg-black text-white rounded cursor-pointer text-center justify-center'}
                            style={{lineHeight: '1rem'}}
                            onClick={clearBoardState}>
                            Clear Board State
                        </button>
                        <p className={'w-80'}>
                            Game Log
                            {logs.map((entry, index) => (
                                <div key={index} className={'text-white'}>
                                    {entry}
                                </div>
                            ))}
                        </p>
                    </div>
                    <div>
                        {isDeckShuffled
                            ? (
                                <Card
                                    shuffledDeck={shuffledDeck}
                                    addLog={addLog}
                                    setAlertMessage={setAlertMessage}
                                    setGameState={setGameState}
                                    gameState={gameState}
                                />
                            )
                            : null}
                    </div>
                </div>
                {alertMessage &&
                    <div className={'text-2xl text-white shadow-2xl shadow-amber-600'}>{alertMessage}</div>
                }
            </div>
        </div>
    )
}

export default Deck;