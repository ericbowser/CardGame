import React, {useEffect, useState} from "react";
import facedown from "../src/assets/facedown4.jpg";
import {Who, Action, GameState} from '../src/Utils';

function Card({shuffledDeck = [], addLog, setAlertMessage, setGameState, gameState}) {
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [cardsSet, setCardsSet] = useState(false);
    const [holeCard, setHoleCard] = useState(null);
    const [dealerBlackJack, setDealerBlackJack] = useState(null);
    const [playerBlackJack, setPlayerBlackJack] = useState(null);
    const [playerHits, setPlayerHits] = useState(null);
    const [playerBust, setPlayerBust] = useState(false);
    const [dealerBust, setDealerBust] = useState(false);
    const [dealerCount, setDealerCount] = useState(false);
    const [playerCount, setPlayerCount] = useState(false);
    const [winner, setWinner] = useState(null);
    const [push, setPush] = useState(null);

    /*
        const [playerHits, setPlayerHits] = useState([]);
    */

    useEffect(() => {
        if (playerBust && !dealerBust) {
            setWinner(Who.Dealer);
            setGameState(GameState.GameConcluded);
        }
        if (!playerBust && dealerBust) {
            setWinner(Who.Player);
            setGameState(GameState.GameConcluded);
        }
    }, [dealerBust, dealerCount, playerBust, playerCount]);

    useEffect(() => {
        if (dealerBlackJack && playerBlackJack) {
            setPush(true);
            setWinner("Push");
            setAlertMessage("Draw or Push!");
            setGameState(GameState.GameConcluded);
        }
        if (playerBlackJack && !dealerBlackJack) {
            setWinner(Who.Player);
            setGameState(GameState.GameConcluded);
        }
        if (dealerBlackJack && !playerBlackJack) {
            setWinner(Who.Dealer);
            setGameState(GameState.GameConcluded);
        }
    }, [dealerBlackJack, playerBlackJack]);

    useEffect(() => {
        if (playerCards.length === 0 && dealerCards.length === 0) {
            setCards();
        }
        // Check for initial BlackJack
        if (playerCards.length === 2 && dealerCards.length === 2) {
            addLog('Dealing Cards...');
            addLog('Checking for BlackJack...');
            checkForBlackJack(dealerCards, Who.Dealer);
            checkForBlackJack(playerCards, Who.Player);
            if (dealerBlackJack && !playerBlackJack) {
                setWinner(Who.Dealer);
                setGameState(GameState.GameConcluded);
            } else if (playerBlackJack && !dealerBlackJack) {
                //setWinner()
            } else if (!playerBlackJack && !dealerBlackJack) {

            }
            setPlayerHand();
            setDealerHand();
        }
    }, [playerCards, dealerCards, cardsSet, holeCard]);

    const setCards = () => {
        if (playerCards.length === 0
            && dealerCards.length === 0
            && cardsSet !== true
            && shuffledDeck.length === 52) {

            let player = [];
            let dealer = [];

            const playerCard = shuffledDeck.pop();
            const playerCard2 = shuffledDeck.pop();
            console.log('player card ', playerCard);
            console.log('player card2 ', playerCard2);

            player.push(playerCard);
            player.push(playerCard2);

            const dealerCard = shuffledDeck.pop();
            const dealerCard2 = shuffledDeck.pop();
            console.log('Dealer card ', dealerCard);
            console.log('Dealer card 2 (Hole) ', dealerCard2);

            dealer.push(dealerCard);
            dealer.push(dealerCard2);

            setDealerCards(dealer);
            setPlayerCards(player);
            setHoleCard(dealerCard2);
            setCardsSet(true);
        }
    }

    function setDealerHand() {
        let dealerHandTotal = 0;
        dealerCards.forEach(card => {
            const regex = /\d+/g;
            const numbers = card.match(regex);
            if (numbers && numbers.length > 0) {
                const parsed = parseInt(numbers[0]);
                dealerHandTotal += parsed;
            } else if (Boolean(card.includes("ace"))) {
                const isOne = ((dealerHandTotal + 11) > 21);
                console.log('ace or one dealer: ', dealerHandTotal + 11)
                if (isOne) {
                    dealerHandTotal += 1;
                } else {
                    dealerHandTotal += 11;
                }
            } else if (checkFaceSingle(card)) {
                dealerHandTotal += 10;
            }
        });
        setDealerCount(dealerHandTotal);
        if (dealerHandTotal > 21) {
            setDealerBust(true);
            setAlertMessage("Dealer Busts!");
            setGameState(GameState.GameConcluded);
        }

        console.log('dealer hand total: ', dealerHandTotal);
    }

    function setPlayerHand() {
        let playerHandTotal = 0;
        playerCards.forEach(card => {
            const regex = /\d+/g;
            const numbers = card.match(regex);
            if (numbers && numbers.length > 0) {
                const parsed = parseInt(numbers[0]);
                playerHandTotal += parsed;
            } else if (checkFaceSingle(card)) {
                playerHandTotal += 10;
            }
        });
        playerCards.forEach(card => {
            if (Boolean(card.includes("ace"))) {
                const isOne = ((playerHandTotal + 11) > 21);
                console.log('ace or one player: ', playerHandTotal + 11)
                if (isOne) {
                    playerHandTotal += 1;
                } else {
                    playerHandTotal += 11;
                }
            }
        })
        setPlayerCount(playerHandTotal);
        if (playerHandTotal > 21) {
            setPlayerBust(true);
            setAlertMessage("Player Busts!");
            setGameState(GameState.GameConcluded);
        }

        console.log('player hand total: ', playerHandTotal);
    }

    const hitOrStayDealer = (choice = '') => {
        if (choice === Action.Hit) {
            addLog("Dealer hits");
            const card = shuffledDeck.pop();
            dealerCards.push(card);
            setDealerCards(dealerCards);
            setDealerHand();
        } else if (choice === Action.Stay) {
            addLog("Dealer Stays");
            setGameState(GameState.GameConcluded);
        }
    }
    const hitOrStayPlayer = (choice = '') => {
        if (choice === Action.Hit) {
            addLog("Player hits");
            const card = shuffledDeck.pop();
            playerCards.push(card);
            setPlayerCards(playerCards);
            const newPlayerHits = playerHits + 1;
            setPlayerHits(newPlayerHits);
            setPlayerHand();
        } else if (choice === Action.Stay) {
            addLog("Player Stays");
            setGameState(GameState.DealerPhase);
        }
    }

    function checkFaceSingle(card = '') {
        let exists = false;
        if (card.includes('10')) {
            exists = true;
        } else if (card.includes('queen')) {
            exists = true;
        } else if (card.includes('king')) {
            exists = true;
        } else if (card.includes('jack')) {
            exists = true;
        }
        return exists;
    }

    function checkFace(cards = []) {
        let exists = false;
        cards.forEach(x => {
            if (x.includes('10')) {
                exists = true;
            } else if (x.includes('queen')) {
                exists = true;
            } else if (x.includes('king')) {
                exists = true;
            } else if (x.includes('jack')) {
                exists = true;
            }
        });
        return exists;
    }

    function checkForBlackJack(cards = [], who = '') {
        const ace = cards.find(y => y.includes('ace'));
        if (ace?.length > 0) {
            const isFaceCard = checkFace(cards);
            if (isFaceCard) {
                if (who === Who.Dealer) {
                    setDealerBlackJack("BlackJack");
                    setAlertMessage("Dealer BlackJack!");
                    setGameState(GameState.GameConcluded);
                }
                if (who === Who.Player) {
                    setPlayerBlackJack("BlackJack");
                    setAlertMessage("Player BlackJack!");
                    setGameState(GameState.GameConcluded);
                }
                addLog(`${who} BlackJack!`);
            } else {
                setGameState(GameState.PlayerPhase);
                setCardsSet(true);
            }
        } else {
            setGameState(GameState.PlayerPhase);
            setCardsSet(true);
        }
    }
    
    const getPlayerCards = () => {
        let left = 520;
        let top = 575;
        return (playerCards.map((card, index) => {
                if (index >= 2) {
                    left += 30;
                    return (
                        <div key={`${card}${index}`}
                             className={'text-white rounded-md'}>
                            <img
                                style={{position: 'absolute', left: `${left}px`, top: `${top}px`}}
                                src={card}
                                alt={'images'}
                                width={120}
                            />
                        </div>
                    )
                } else {
                    return (
                        <div key={`${card}${index}`}
                             className={'m-2 w-32 h-48 bg-radial-green-yellow text-white rounded-md flex items-center justify-center'}>
                            <img
                                src={card}
                                alt={'images'}
                                width={120}
                            />
                        </div>
                    )
                }
            })
        )
    }

    const getDealerCards = () => {
        let left = 720;
        let top = 158;
        return dealerCards.map((card, index) => {
                const isHole = index === 1;
                if (index >= 2) {
                    left += 30;
                    return (
                        <div key={`${card}${index}`}
                             className={'text-white rounded-md'}>
                            <img
                                style={{position: 'absolute', left: `${left}px`, top: `${top}px`}}
                                src={card}
                                alt={'images'}
                                width={120}
                            />
                        </div>
                    )
                }
                return (
                    <div key={`${card}${index}`}
                         className={'m-2 w-32 h-48 bg-radial-green-yellow text-white rounded-md flex items-center justify-center'}>
                        <img
                            src={card}
                            alt={'images'}
                            width={120}
                        />
                    </div>
                )
            }
        )
    }

    return (
        <div>
            <div className="mb-10 p-5">
                <h2 className="text-2xl font-bold mb-2 text-left justify-center">
                    Dealer's Hand
                    {dealerBlackJack === "BlackJack" &&
                        <div className={'bg-blue text-rose-800 text-2xl m-10'}>Dealer has BlackJack!</div>
                    }
                    {playerBlackJack === "BlackJack" &&
                        <div className={'bg-blue text-rose-800 text-2xl m-10'}>Player has BlackJack!</div>
                    }
                </h2>
                <div className={'flex gap-10'}>
                    {getDealerCards(dealerCards)}
                </div>
                <div className={'flex gap-10'}>
                    {getPlayerCards(playerCards)}
                </div>
            </div>
            {gameState === GameState.PlayerPhase &&
                <div>
                    <button
                        className={'p-2 m-2 bg-black text-white rounded cursor-pointer text-center justify-center'}
                        onClick={(e) => {
                            e.preventDefault();
                            hitOrStayPlayer("Hit");
                        }}>
                        Hit
                    </button>
                    <button
                        className={'p-2 m-2 bg-black text-white rounded cursor-pointer text-center justify-center'}
                        onClick={(e) => {
                            e.preventDefault();
                            hitOrStayPlayer("Stay");
                        }}>
                        Stay
                    </button>
                </div>
            }
            {gameState === GameState.DealerPhase &&
                <div>
                    <button
                        className={'p-2 m-2 bg-black text-white rounded cursor-pointer text-center justify-center'}
                        onClick={() => hitOrStayDealer("Hit")}>
                        Hit
                    </button>
                    <button
                        className={'p-2 m-2 bg-black text-white rounded cursor-pointer text-center justify-center'}
                        onClick={() => hitOrStayDealer("Stay")}>
                        Stay
                    </button>
                </div>
            }
        </div>
    )
}


export default Card;