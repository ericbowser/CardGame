import React, {useEffect, useState} from 'react';
import facedown from '../src/assets/facedown4.jpg';

const Cards = () => {
    const [deck, setDeck] = useState([]);
    const [shuffledDeck, setShuffledDeck] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [isDeckShuffled, setIsDeckShuffled] = useState(false);
    const [showHoleCard, setHoleCard] = useState(false);
    const [unShuffledCards, setUnShuffledCards] = useState(false);
    const [gameLog, setGameLog] = useState([]);

    const addLog = (message) => {
        setGameLog((prevLog) => [...prevLog, message]);
    };

    const importAllImages = async () => {
        const modulePaths = import.meta.glob('../src/assets/images/*.{png,jpg,jpeg}');
        const imagePromises = Object.keys(modulePaths).map((path) => modulePaths[path]());

        // Resolve all promises to get the actual image paths
        const images = await Promise.all(imagePromises);
        return images;
    };

    const getImages = async () => {
        const images = await importAllImages();
        
        const arr = []
        images.forEach(image => {
            arr.push(image.default);
        });
        
        return arr;
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    useEffect(() => {
    }, [playerCards, dealerCards])

    useEffect(() => {
        if (deck.length === 0) {

            getImages().then(images => {
                setDeck(images);
                addLog("Getting assets");
            });
        }
    }, [deck])

    useEffect(() => {
        if (!isDeckShuffled && deck.length > 0) {
            const shuffled = shuffleDeck();
            setShuffledDeck(shuffled);
            setIsDeckShuffled(true);
        }
    }, [isDeckShuffled, shuffledDeck])

    const handleShuffle = async (event) => {
        addLog("Initializing..");
        if (!isDeckShuffled) {
            const shuffled = shuffleDeck();
            await setShuffledDeck(shuffled);
            await setIsDeckShuffled(true);
        }

        handleDeal();
    }

    const handleDeal = () => {
        if (isDeckShuffled && deck.length > 0) {
            let player = [];
            let dealer = [];

            const card = shuffledDeck.pop();
            const card2 = shuffledDeck.pop();

            dealer.push(card);
            dealer.push(card2);

            const dealercard = shuffledDeck.pop();
            const dealercard2 = shuffledDeck.pop();

            player.push(dealercard);
            player.push(dealercard2);

            setShuffledDeck(shuffledDeck);
            setDealerCards(dealer);
            setPlayerCards(player);
            addLog("Dealing cards..")
        }
    }

    function extractCardValue(url, cardValue) {
        const regex = new RegExp(cardValue, 'i');  // case-insensitive search
        return url.match(regex);  // returns an array if match is found, otherwise null
    }

    function checkBlackJack() {
        // Use find() to locate the URL that contains the specified card value
        const nonHoleCard = dealerCards[0].find(url => extractCardValue(url, 'ace'));
        const holeCard = dealerCards[1].find(url => extractCardValue(url, 'ace'));
        if (nonHoleCard || holeCard) {

        }
    }

    return (
        <div>

            <div className={'flex flex-col justify-center items-center container'}>
                <div className={'mb-10'}>
                    <button
                        className={'px-4 py-2 bg-black text-white rounded cursor-pointer'}
                        onClick={handleShuffle}>
                        Shuffle and Deal
                    </button>
                </div>
                <div className="mb-8 mt-5">
                    <h2 className="text-black text-2xl font-bold mb-2 text-left justify-center">Dealer's Hand</h2>
                    <div className="flex space-x-4 mb-10">
                        <div
                            className="w-32 h-48 bg-radial-green-yellow text-white rounded-md flex items-center justify-center">
                            {playerCards.length > 0
                                ? (<img src={dealerCards[0]} alt={'images'} width={120}/>)
                                : 'Player card 1'
                            }
                        </div>
                        <div
                            className="w-32 h-48 bg-radial-green-yellow text-white rounded-md flex items-center justify-center">
                            {playerCards.length > 0
                                ? (<img src={facedown} alt={'images'} width={120}/>)
                                : 'Player card 2'
                            }
                        </div>
                    </div>
                    <h2 className="text-black text-2xl font-bold mb-2 text-left justify-center mt-10">Player's Hand</h2>
                    <div className="flex space-x-4 m-22">
                        <div
                            className="w-32 h-48 bg-radial-green-yellow text-white rounded-md flex items-center justify-center">
                            {playerCards.length > 0
                                ? (<img src={playerCards[0]} alt={'images'} width={120}/>)
                                : 'Player card 1'
                            }
                        </div>
                        <div
                            className="w-32 h-48 bg-radial-green-yellow text-white rounded-md flex items-center justify-center">
                            {playerCards.length > 0
                                ? (<img src={playerCards[1]} alt={'images'} width={120}/>)
                                : 'Player card 2'
                            }
                        </div>
                        <div className={'flex flex-col space-between'}>
                            <h2>Game Log</h2>
                            <div >
                                {gameLog.map((entry, index) => (
                                    <div key={index} className="text-md text-gray-700">
                                        {entry}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cards;