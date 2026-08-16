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
import { getViewportFraming, useIsNarrowViewport } from './viewportFraming';

useTexture.preload(facedown);

function CameraRig() {
    const { camera, size } = useThree();
    const controlsRef = useRef(null);
    const layoutKey = useRef('');
    const framing = getViewportFraming(size.width, size.height);

    useFrame(() => {
        if (!camera.isPerspectiveCamera) {
            return;
        }

        const { topY, playerZ, dealerZ } = tableLayout;
        const playCenterZ = framing.isPortrait
            ? dealerZ * 0.42 + playerZ * 0.58
            : (playerZ + dealerZ) / 2;
        const key = `${topY.toFixed(3)}:${playCenterZ.toFixed(3)}:${size.width.toFixed(0)}x${size.height.toFixed(0)}`;

        if (layoutKey.current === key) {
            return;
        }

        layoutKey.current = key;

        camera.position.set(
            0,
            topY + framing.distance * framing.heightMul,
            playerZ + framing.distance * framing.zMul,
        );
        camera.fov = framing.fov;
        camera.near = 0.1;
        camera.far = 200;
        camera.lookAt(0, topY + 0.02, playCenterZ);
        camera.updateProjectionMatrix();

        if (controlsRef.current) {
            controlsRef.current.target.set(0, topY + 0.02, playCenterZ);
            controlsRef.current.update();
        }
    });

    const playCenterZ = framing.isPortrait
        ? tableLayout.dealerZ * 0.42 + tableLayout.playerZ * 0.58
        : (tableLayout.playerZ + tableLayout.dealerZ) / 2;

    return (
        <OrbitControls
            ref={controlsRef}
            enabled={framing.enableOrbit}
            enablePan={false}
            minPolarAngle={Math.PI / 4.2}
            maxPolarAngle={Math.PI / 2.35}
            minDistance={framing.minDistance}
            maxDistance={framing.maxDistance}
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
    const { size } = useThree();
    const framing = getViewportFraming(size.width, size.height);
    const hasCards =
        playerHands.some((hand) => hand.cards.length > 0) || dealerCards.length > 0;
    const splitOffsets = [-framing.splitOffset, framing.splitOffset];

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
    const isMobile = useIsNarrowViewport();

    return (
        <Canvas
            dpr={isMobile ? [1, 1.15] : [1, 1.5]}
            gl={{
                antialias: !isMobile,
                powerPreference: 'high-performance',
                stencil: false,
            }}
            style={{ width: '100%', height: '100%', touchAction: isMobile ? 'pan-y' : 'none' }}
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
