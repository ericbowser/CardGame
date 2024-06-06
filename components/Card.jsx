import React, {useEffect, useState} from "react";
import facedown from "../src/assets/facedown4.jpg";
import useGameLog from "./GameLog";

function Card({ shuffledDeck = []}) {
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [cardsSet, setCardsSet] = useState(false);
    const [holeCard, setHoleCard] = useState(null);
    const [blackJack, setBlackJack] = useState(null);

    const {logs, addLog, printLog} = useGameLog([]);

    const setCards = () => {
        if (playerCards.length === 0
            && dealerCards.length === 0) {

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

    useEffect(() => {
        if (playerCards.length === 0 && dealerCards.length === 0) {
            setCards();
        }
        if (holeCard !== '' && playerCards.length === 2 && dealerCards.length === 2) {
            chackForBlackJack();
        }
    }, [playerCards, dealerCards, cardsSet, holeCard, blackJack]);

    const getPair = (cards = [], who = '') => {
        if (cards.length === 2) {
            return (
                cards.map((card, index) => {
                    const isHole = (who === 'Dealer' && index === 1);
                    return (
                        <div
                            key={`${card}${index}`}
                            className={'m-2 w-32 h-48 bg-radial-green-yellow text-white rounded-md flex items-center justify-center'}>
                            <img
                                src={isHole ? facedown : card}
                                alt={'images'}
                                width={120}
                            />
                        </div>
                    )
                })
            )
        }
    }

    function checkFace() {
        let exists = false;
        dealerCards.forEach(x => {
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

    function chackForBlackJack() {
        addLog('Checking for BlackJack...');
        const firstAce = dealerCards[0].includes('ace');
        if (firstAce) {
            const isFaceCard = checkFace();
            if (isFaceCard) {
                setBlackJack(true);
                addLog('Dealer BlackJack!');
            } else {
                setBlackJack(false);
            }
        }
    }

    /*    function extractCardValue(url, cardValue) {
            const regex = new RegExp(cardValue, 'i');  // case-insensitive search
            const matched = url?.match(regex);  // returns an array if match is found, otherwise null
            return matched !== null && matched.length > 0;
        }
    
        function blackJack(card1, card2) {
            const blackJack = card1 + card2;
            console.log(blackJack);
            return blackJack === 21;
        }*/

    return (
        <div className={'ml-20'}>
            <div className="mb-10 p-5">
                <h2 className="text-black text-2xl font-bold mb-2 text-left justify-center">
                    Dealer's Hand
                    {blackJack &&
                        <span className={'bg-blue text-white text-2xl m-10'}>Dealer BlackJack</span>
                    }
                </h2>
                <div className={'flex gap-10'}>
                    {getPair(dealerCards, 'Dealer')}
                </div>
                <div className={'flex gap-10'}>
                    {getPair(playerCards, 'Player')}
                </div>
            </div>
        </div>
    )
}


export default Card;