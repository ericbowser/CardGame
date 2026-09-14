import { getCypressCardDealStaggerMs, isAutomationHost, isCypressWatchPace } from '../../e2e/e2ePacing';
import { isAiWatchPace } from '../../e2e/aiWatchPacing';
import { Suspense, useLayoutEffect, useRef } from 'react';
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
    // Fly-from-deck only once per mounted card. Later layout shifts (hits, splits,
    // parent re-renders) should ease in place — never replay the deal.
    const hasDealtRef = useRef(false);
    const watchPace = isCypressWatchPace() || isAiWatchPace();
    const dealStaggerMs = getCypressCardDealStaggerMs(watchPace ? 170 : 110);

    const tx = targetPosition[0];
    const ty = targetPosition[1];
    const tz = targetPosition[2];
    const ox = deckOrigin[0];
    const oy = deckOrigin[1];
    const oz = deckOrigin[2];

    const [{ position, rotation }] = useSpring(
        () => {
            const firstDeal = !hasDealtRef.current;
            hasDealtRef.current = true;

            return {
                from: firstDeal
                    ? {
                          position: [ox, oy, oz],
                          rotation: [-Math.PI / 2, 0, 0.35],
                      }
                    : undefined,
                to: {
                    position: [tx, ty, tz],
                    rotation: [-Math.PI / 2, 0, targetRotationZ],
                },
                delay: firstDeal ? dealIndex * dealStaggerMs : 0,
                config: watchPace
                    ? { tension: 130, friction: 24 }
                    : { tension: 180, friction: 22 },
            };
        },
        [tx, ty, tz, targetRotationZ, dealIndex, ox, oy, oz, dealStaggerMs, watchPace],
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
