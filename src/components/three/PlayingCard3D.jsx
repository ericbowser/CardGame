import { getCypressCardDealStaggerMs, isAutomationHost, isCypressWatchPace } from '../../e2e/e2ePacing';
import { isAiWatchPace } from '../../e2e/aiWatchPacing';
import { Suspense, useLayoutEffect } from 'react';
import { useTexture } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import * as THREE from 'three';

export const CARD_WIDTH = 0.88;
export const CARD_HEIGHT = 1.23;
export const CARD_LIFT = 0.014;

const AnimatedMesh = animated('mesh');
const configuredTextures = new WeakSet();

function configureCardTexture(texture) {
    if (configuredTextures.has(texture)) {
        return;
    }

    configuredTextures.add(texture);
    texture.anisotropy = isAutomationHost() ? 1 : 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
}

function StaticCardMesh({
    faceMap,
    targetPosition,
    targetRotationZ = 0,
}) {
    return (
        <mesh
            position={targetPosition}
            rotation={[-Math.PI / 2, 0, targetRotationZ]}
        >
            <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
            <meshBasicMaterial
                map={faceMap}
                toneMapped={false}
                side={THREE.FrontSide}
            />
        </mesh>
    );
}

function PlayingCardMesh({
    frontSrc,
    backSrc,
    targetPosition,
    targetRotationZ = 0,
    faceDown = false,
    dealIndex = 0,
    deckOrigin = [5.4, 0.25, -0.8],
}) {
    const [frontMap, backMap] = useTexture([frontSrc, backSrc]);

    useLayoutEffect(() => {
        configureCardTexture(frontMap);
        configureCardTexture(backMap);
    }, [frontMap, backMap]);

    const faceMap = faceDown ? backMap : frontMap;

    if (isAutomationHost()) {
        return (
            <StaticCardMesh
                faceMap={faceMap}
                targetPosition={targetPosition}
                targetRotationZ={targetRotationZ}
            />
        );
    }

    return (
        <AnimatedCardMesh
            faceMap={faceMap}
            targetPosition={targetPosition}
            targetRotationZ={targetRotationZ}
            dealIndex={dealIndex}
            deckOrigin={deckOrigin}
        />
    );
}

function AnimatedCardMesh({
    faceMap,
    targetPosition,
    targetRotationZ,
    dealIndex,
    deckOrigin,
}) {
    const watchPace = isCypressWatchPace() || isAiWatchPace();
    const dealStaggerMs = getCypressCardDealStaggerMs(watchPace ? 280 : 110);

    const [{ position, rotation }] = useSpring(
        () => ({
            from: {
                position: deckOrigin,
                rotation: [-Math.PI / 2, 0, 0.35],
            },
            to: {
                position: targetPosition,
                rotation: [-Math.PI / 2, 0, targetRotationZ],
            },
            delay: dealIndex * dealStaggerMs,
            config: watchPace
                ? { tension: 90, friction: 28 }
                : { tension: 180, friction: 22 },
            reset: true,
        }),
        [targetPosition, targetRotationZ, dealIndex, deckOrigin, dealStaggerMs, watchPace],
    );

    return (
        <AnimatedMesh position={position} rotation={rotation}>
            <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
            <meshBasicMaterial
                map={faceMap}
                toneMapped={false}
                side={THREE.FrontSide}
            />
        </AnimatedMesh>
    );
}

export function PlayingCard3D(props) {
    return (
        <Suspense fallback={null}>
            <PlayingCardMesh {...props} />
        </Suspense>
    );
}
