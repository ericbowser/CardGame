import React, {useEffect, useState} from 'react';
import Card from "./Card";
import useGameLog from "./GameLog";

const BlackJack = () => {
    const [deck, setDeck] = useState([]);
    const [shuffledDeck, setShuffledDeck] = useState([]);
    const [isDeckShuffled, setIsDeckShuffled] = useState(false);

    const {logs, addLog, printLog} = useGameLog([]);

    const importAllImages = async () => {
        const modulePaths = import.meta.glob('../src/assets/images/*.{png,jpg,jpeg}');
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
        if (deck?.length === 0) {
            getImages().then(images => {
                addLog('Importing assets..');
            });
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
    }

    function extractCardValue(url, cardValue) {
        const regex = new RegExp(cardValue, 'i');  // case-insensitive search
        const matched = url?.match(regex);  // returns an array if match is found, otherwise null
        return matched !== null && matched.length > 0;
    }

    function blackJack(card1, card2) {
        const blackJack = card1 + card2;
        console.log(blackJack);
        return blackJack === 21;
    }

    return (
        <div>
            <section className={'flex'}>
                <button
                    className={'py-2 px-2 bg-black text-white rounded cursor-pointer text-center justify-center'}
                    onClick={shuffleDeck}>
                    Shuffle and Deal
                </button>
                <button
                    className={'py-2 px-2 bg-black text-white rounded cursor-pointer text-center justify-center'}
                    onClick={clearBoardState}>
                    Clear Board State
                </button>
            </section>
            <div className={'flex text-center justify-center m-10'}>
                <p className={'w-48'}>
                    Game Log
                    {logs.map((entry, index) => (
                        <div key={index} className={'text-white'}>
                            {entry}
                        </div>
                    ))}
                </p>
                <div className={'flex flex-col container'}>
                    {isDeckShuffled
                        ? (
                            <Card shuffledDeck={shuffledDeck}/>
                        )
                        : null}
                </div>
            </div>
        </div>
    )
}

export default BlackJack;