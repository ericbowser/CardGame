import { Suspense, memo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    ContactShadows,
    OrbitControls,
    PerspectiveCamera,
    useTexture,
} from '@react-three/drei';
import facedown from '../../assets/facedown4.jpg';
import { CardHand3D } from './CardHand3D';
import { CasinoTable } from './CasinoTable';
import { tableLayout } from './tableLayout';
import { DeckStack3D } from './DeckStack3D';

useTexture.preload(facedown);

function CameraRig() {
    const { camera, size } = useThree();
    const controlsRef = useRef(null);
    const aspect = size.width / size.height;
    const layoutKey = useRef('');

    useFrame(() => {
        if (!camera.isPerspectiveCamera) {
            return;
        }

        const { topY, playerZ, dealerZ } = tableLayout;
        const playCenterZ = (playerZ + dealerZ) / 2;
        const key = `${topY.toFixed(3)}:${playCenterZ.toFixed(3)}:${aspect.toFixed(2)}`;

        if (layoutKey.current === key) {
            return;
        }

        layoutKey.current = key;

        const distance = aspect > 1.8 ? 9 : aspect > 1.2 ? 10 : 11;

        camera.position.set(0, topY + distance * 0.92, playerZ + distance * 0.62);
        camera.fov = aspect > 1.5 ? 36 : 34;
        camera.near = 0.1;
        camera.far = 200;
        camera.lookAt(0, topY + 0.02, playCenterZ);
        camera.updateProjectionMatrix();

        if (controlsRef.current) {
            controlsRef.current.target.set(0, topY + 0.02, playCenterZ);
            controlsRef.current.update();
        }
    });

    const playCenterZ = (tableLayout.playerZ + tableLayout.dealerZ) / 2;

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minPolarAngle={Math.PI / 4.2}
            maxPolarAngle={Math.PI / 2.35}
            minDistance={7.5}
            maxDistance={20}
            target={[0, tableLayout.topY + 0.02, playCenterZ]}
        />
    );
}

function FirstFrameReady({ onReady }) {
    const sent = useRef(false);

    useFrame(() => {
        if (sent.current) {
            return;
        }

        sent.current = true;
        queueMicrotask(() => onReady?.());
    });

    return null;
}

function SceneContents({
    playerHands,
    dealerCards,
    showHoleCard,
    cardsRemaining,
    totalCardsInShoe,
    isDeckShuffled,
    onSceneReady,
}) {
    const hasCards =
        playerHands.some((hand) => hand.cards.length > 0) || dealerCards.length > 0;

    const splitOffsets = [-1.35, 1.35];

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 4.5, 7]} fov={42} />
            <CameraRig />
            <FirstFrameReady onReady={onSceneReady} />

            <ambientLight intensity={0.42} />
            <hemisphereLight
                intensity={0.32}
                color="#fff2dd"
                groundColor="#0a0a0a"
            />
            <directionalLight
                intensity={1.05}
                position={[4, 10, 4]}
            />
            <pointLight intensity={0.45} position={[-4, 5, 3]} color="#ffd9a0" />

            <CasinoTable />

            <Suspense fallback={null}>
                {isDeckShuffled && cardsRemaining > 0 && (
                    <DeckStack3D
                        position={tableLayout.deckPosition}
                        backSrc={facedown}
                        cardsRemaining={cardsRemaining}
                        totalCards={totalCardsInShoe}
                    />
                )}
            </Suspense>

            {hasCards && (
                <>
                    <CardHand3D
                        handId="dealer"
                        cards={dealerCards}
                        backSrc={facedown}
                        zPosition={tableLayout.dealerZ}
                        showHoleCard={showHoleCard}
                        holeCardIndex={1}
                        dealOffset={0}
                    />
                    {playerHands.map((hand, index) => (
                        <CardHand3D
                            key={hand.id}
                            handId={`player-${index}`}
                            cards={hand.cards}
                            backSrc={facedown}
                            zPosition={tableLayout.playerZ}
                            xOffset={playerHands.length > 1 ? splitOffsets[index] ?? 0 : 0}
                            showHoleCard
                            holeCardIndex={-1}
                            dealOffset={dealerCards.length + index * 2}
                        />
                    ))}
                </>
            )}

            <ContactShadows
                frames={1}
                position={[0, 0.005, tableLayout.playerZ * 0.4]}
                opacity={0.38}
                scale={tableLayout.radius * 2.2}
                blur={1.8}
                far={10}
            />
        </>
    );
}

const MemoSceneContents = memo(SceneContents);

function BlackjackScene({
    playerHands,
    dealerCards,
    showHoleCard,
    cardsRemaining,
    totalCardsInShoe,
    isDeckShuffled,
    onSceneReady,
}) {
    return (
        <Canvas
            dpr={[1, 1.5]}
            gl={{
                antialias: true,
                powerPreference: 'high-performance',
                stencil: false,
            }}
            style={{ width: '100%', height: '100%' }}
        >
            <Suspense fallback={null}>
                <MemoSceneContents
                    playerHands={playerHands}
                    dealerCards={dealerCards}
                    showHoleCard={showHoleCard}
                    cardsRemaining={cardsRemaining}
                    totalCardsInShoe={totalCardsInShoe}
                    isDeckShuffled={isDeckShuffled}
                    onSceneReady={onSceneReady}
                />
            </Suspense>
        </Canvas>
    );
}

export default memo(BlackjackScene);
