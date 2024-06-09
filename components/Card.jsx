import React, {useEffect, useState} from "react";
import facedown from "../src/assets/facedown4.jpg";
import Utils from '../src/Utils';

function Card({
                  shuffledDeck = [], addLog = () => {
    }
              }) {
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [cardsSet, setCardsSet] = useState(false);
    const [holeCard, setHoleCard] = useState(null);
    const [dealerBlackJack, setDealerBlackJack] = useState(null);
    const [playerBlackJack, setPlayerBlackJack] = useState(null);
    const [playerPhase, setPlayerPhase] = useState(false);
    const [hitOrStay, setHitOrStay] = useState(null);
    const [playerHits, setPlayerHits] = useState([]);

    const setCards = () => {
        addLog('Dealing cards...');
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
    
    const checkPlayerBust = () => {
        playerCards.map((card, index) => {
            Utils.forEach(x => {
                const hasValue = card.includes(x["10"]);
                console.log(hasValue);
            })
       /*     const king = card.includes(Utils.find(x => x.king.toString() === x));
            const queen = card.includes(Utils.find(x => x.queen.toString()) === x);
            const ten = card.includes(Utils.find(x => x.ten.toString()) === x);*/
            
/*
            const jack = card.includes(Utils.jack);
            const jack = card.includes(Utils.jack);
            const jack = card.includes(Utils.jack);
            const jack = card.includes(Utils.jack);
            const jack = card.includes(Utils.jack);
            const jack = card.includes(Utils.jack);
*/
        })
    }

    const hitOrStayChoice = (choice = "") => {
        if (choice === "Hit") {
            addLog("Player hits");
            const card = shuffledDeck.pop();
            playerCards.push(card);
            setPlayerCards(playerCards);
            const newPlayerHits = playerHits + 1;
            setPlayerHits(newPlayerHits);
            checkPlayerBust();
        } else if (choice === "Stay") {
            addLog("Player Stays");
            setPlayerPhase(false);
        }
    }

    useEffect(() => {
    }, [playerPhase]);

    useEffect(() => {
        if (playerCards.length === 0 && dealerCards.length === 0) {
            setCards();
        }
        if (playerCards.length === 2 && dealerCards.length === 2) {
            checkForBlackJack(dealerCards, "Dealer");
            checkForBlackJack(playerCards, "Player");
        }
       /* if (playerPhase && blackJack !== "BlackJack") {
            addLog("Play phase. Asking to hit or stay..");
        }*/
    }, [playerCards, dealerCards, cardsSet, holeCard, dealerBlackJack, playerBlackJack]);

    const getPlayerCards = () => {
        let left;
        let top;
        if (playerHits === 1) {
            left = 507;
            top = 403;
        }
        if (playerHits > 1) {
            left += 20;
        }
        console.log('player card length: ', playerCards.length);
        return (playerCards.map((card, index) =>
            (playerHits > 0 && index >= 2 ? (
                    <div key={`${card}${index}`}
                         className={'text-white rounded-md'}>
                        <img
                            style={{position: 'absolute', left: `${left}px`, top: `${top}px`}}
                            src={card}
                            alt={'images'}
                            width={120}
                        />
                    </div>
                ) : (
                    <div key={`${card}${index}`}
                         className={'m-2 w-32 h-48 bg-radial-green-yellow text-white rounded-md flex items-center justify-center'}>
                        <img
                            src={card}
                            alt={'images'}
                            width={120}
                        />
                    </div>
                )
            )
        ))
    }

    const getDealerCards = () => {
        return dealerCards.map((card, index) => {
                const isHole = index === 1;
                return (
                    <div key={`${card}${index}`}
                         className={'m-2 w-32 h-48 bg-radial-green-yellow text-white rounded-md flex items-center justify-center'}>
                        <img
                            src={isHole && dealerBlackJack !== "BlackJack" ? facedown : card}
                            alt={'images'}
                            width={120}
                        />
                    </div>
                )
            }
        )
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
        addLog('Checking for BlackJack...');
        const ace = cards.find(y => y.includes('ace'));
        if (ace?.length > 0) {
            const isFaceCard = checkFace(cards);
            if (isFaceCard) {
                if (who === 'Dealer') {
                    setDealerBlackJack("BlackJack");
                } else {
                    setPlayerBlackJack("BlackJack");
                }
                addLog(`${who} BlackJack!`);
            } else {
                setPlayerPhase(true);
                setCardsSet(true);
            }
        } else {
            setPlayerPhase(true);
            setCardsSet(true);
        }
    }

    return (
        <div className={'ml-20'}>
            <div className="mb-10 p-5">
                <h2 className="text-2xl font-bold mb-2 text-left justify-center">
                    Dealer's Hand
                    {dealerBlackJack === "BlackJack" &&
                        <div className={'bg-blue text-rose-800 text-2xl m-10'}>Dealer BlackJack!</div>
                    }
                    {playerBlackJack === "BlackJack" &&
                        <div className={'bg-blue text-rose-800 text-2xl m-10'}>Player has 21</div>
                    }
                </h2>
                <div className={'flex gap-10'}>
                    {getDealerCards(dealerCards)}
                </div>
                <div className={'flex gap-10'}>
                    {getPlayerCards(playerCards)}
                </div>
            </div>
            {playerPhase && (
                <div>
                    <button
                        className={'py-2 px-2 bg-black text-white rounded cursor-pointer text-center justify-center'}
                        onClick={() => hitOrStayChoice("Hit")}>
                        Hit
                    </button>
                    <button
                        className={'py-2 px-2 bg-black text-white rounded cursor-pointer text-center justify-center'}
                        onClick={() => hitOrStayChoice("Stay")}>
                        Stay
                    </button>
                </div>
            )
            }
        </div>
    )
}


export default Card;