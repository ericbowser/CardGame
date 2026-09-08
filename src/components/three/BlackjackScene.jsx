import { Suspense, memo, useCallback, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { debugLog } from '../../e2e/debugLog';
import {
    ContactShadows,
    OrbitControls,
    OrthographicCamera,
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

import { isAutomationHost } from '../../e2e/e2ePacing';

function MobileOverheadCamera() {
    const { size } = useThree();
    const cameraRef = useRef(null);

    useFrame(() => {
        const camera = cameraRef.current;
        if (!camera) {
            return;
        }

        const { topY, playerZ, dealerZ, radius } = tableLayout;
        const aspect = size.width / Math.max(size.height, 1);
        const extraTop = 1.15;
        const lookZ = (dealerZ + playerZ) / 2 + extraTop / 2;
        const playWidth = Math.min(radius * 1.05, 6.4);
        const playDepth = Math.abs(playerZ - dealerZ) + 2.8 + extraTop;

        let worldHeight = playDepth;
        let worldWidth = worldHeight * aspect;
        if (worldWidth > playWidth) {
            worldWidth = playWidth;
            worldHeight = worldWidth / Math.max(aspect, 0.01);
        }

        camera.up.set(0, 0, -1);
        camera.position.set(0, topY + 6, lookZ);
        camera.lookAt(0, topY, lookZ);
        camera.near = 0.1;
        camera.far = 40;
        camera.left = -worldWidth / 2;
        camera.right = worldWidth / 2;
        camera.top = worldHeight / 2;
        camera.bottom = -worldHeight / 2;
        camera.zoom = 1;
        camera.updateProjectionMatrix();
    });

    return (
        <OrthographicCamera
            ref={cameraRef}
            makeDefault
            manual
            near={0.1}
            far={40}
            position={[0, 6, 1.5]}
            up={[0, 0, -1]}
        />
    );
}

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
        const key = `${topY.toFixed(3)}:${playerZ.toFixed(3)}:${size.width.toFixed(0)}x${size.height.toFixed(0)}`;

        if (layoutKey.current === key) {
            return;
        }

        layoutKey.current = key;

        camera.up.set(0, 1, 0);
        const lookZ = (playerZ + dealerZ) / 2;
        camera.position.set(
            0,
            topY + framing.distance * framing.heightMul,
            playerZ + framing.distance * framing.zMul,
        );
        camera.fov = framing.fov;
        camera.near = 0.1;
        camera.far = 200;
        camera.lookAt(0, topY + 0.02, lookZ);
        camera.updateProjectionMatrix();

        if (controlsRef.current) {
            controlsRef.current.target.set(0, topY + 0.02, lookZ);
            controlsRef.current.update();
        }
    });

    if (!framing.enableOrbit) {
        return null;
    }

    const lookZ = (tableLayout.playerZ + tableLayout.dealerZ) / 2;

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minPolarAngle={Math.PI / 4.2}
            maxPolarAngle={Math.PI / 2.35}
            minDistance={framing.minDistance}
            maxDistance={framing.maxDistance}
            target={[0, tableLayout.topY + 0.02, lookZ]}
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
    dealEpoch,
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
            {framing.isMobile || framing.useOverheadDesktop ? (
                <MobileOverheadCamera />
            ) : (
                <>
                    <PerspectiveCamera makeDefault position={[0, 4.5, 7]} fov={42} />
                    <CameraRig />
                </>
            )}
            <FirstFrameReady onReady={onSceneReady} />

            <ambientLight intensity={0.72} />
            <hemisphereLight
                intensity={0.58}
                color="#fff6e8"
                groundColor="#1a1410"
            />
            <directionalLight
                intensity={1.45}
                position={[3, 9, 5]}
            />
            <directionalLight
                intensity={0.55}
                position={[-3, 6, 2]}
                color="#ffe4c2"
            />
            <pointLight intensity={0.85} position={[0, 6, 2]} color="#ffefd6" />

            <CasinoTable />

            <Suspense fallback={null}>
                {isDeckShuffled && cardsRemaining > 0 && !framing.isMobile && (
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
                        dealOffset={dealEpoch * 20}
                    />
                    {playerHands.map((hand, index) => (
                        <CardHand3D
                            key={hand.id}
                            handId={hand.id}
                            cards={hand.cards}
                            backSrc={facedown}
                            zPosition={tableLayout.playerZ}
                            xOffset={playerHands.length > 1 ? splitOffsets[index] ?? 0 : 0}
                            showHoleCard
                            holeCardIndex={-1}
                            dealOffset={dealEpoch * 20 + dealerCards.length + index * 2}
                        />
                    ))}
                </>
            )}

            {!isAutomationHost() && (
                <ContactShadows
                    frames={1}
                    position={[0, 0.005, tableLayout.playerZ * 0.4]}
                    opacity={0.38}
                    scale={tableLayout.radius * 2.2}
                    blur={1.8}
                    far={10}
                />
            )}
        </>
    );
}

const MemoSceneContents = memo(SceneContents);

function BlackjackScene({
    playerHands,
    dealerCards,
    showHoleCard,
    dealEpoch = 0,
    cardsRemaining,
    totalCardsInShoe,
    isDeckShuffled,
    onSceneReady,
}) {
    const isMobile = useIsNarrowViewport();
    const [canvasKey, setCanvasKey] = useState(0);

    const automation = isAutomationHost();

    const handleCanvasCreated = useCallback(({ gl, invalidate }) => {
        const canvas = gl.domElement;

        canvas.addEventListener(
            'webglcontextlost',
            (event) => {
                event.preventDefault();
                // #region agent log
                debugLog('BlackjackScene:webgl', 'context lost', { automation }, 'H-B');
                // #endregion
                if (!automation) {
                    setCanvasKey((key) => key + 1);
                }
            },
            false,
        );

        canvas.addEventListener(
            'webglcontextrestored',
            () => {
                gl.resetState?.();
                invalidate();
            },
            false,
        );
    }, [automation]);

    return (
        <Canvas
            key={canvasKey}
            dpr={automation ? 1 : isMobile ? [1, 2] : [1, 2]}
            frameloop="always"
            gl={{
                antialias: !automation,
                powerPreference: automation ? 'default' : 'high-performance',
                stencil: false,
                preserveDrawingBuffer: automation,
                failIfMajorPerformanceCaveat: false,
            }}
            onCreated={handleCanvasCreated}
            style={{ width: '100%', height: '100%', touchAction: isMobile ? 'pan-y' : 'none' }}
        >
            <Suspense fallback={null}>
                <MemoSceneContents
                    playerHands={playerHands}
                    dealerCards={dealerCards}
                    showHoleCard={showHoleCard}
                    dealEpoch={dealEpoch}
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
