import { Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import { useLayoutEffect } from 'react';
import * as THREE from 'three';

export const CARD_WIDTH = 0.88;
export const CARD_HEIGHT = 1.23;
export const CARD_LIFT = 0.014;

const AnimatedMesh = animated('mesh');

function configureCardTexture(texture) {
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
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
            delay: dealIndex * 110,
            config: { tension: 180, friction: 22 },
        }),
        []
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
