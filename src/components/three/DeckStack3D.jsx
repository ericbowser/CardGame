import { useTexture } from '@react-three/drei';
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { CARD_HEIGHT, CARD_WIDTH } from './PlayingCard3D';

const CARD_THICKNESS = 0.011;
const FULL_STACK_HEIGHT = 0.58;

function configureCardTexture(texture) {
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
}

/** Procedural casino shoe + depleting card stack (no extra GLB required). */
export function DeckStack3D({
    position = [3.4, 0, -2.4],
    backSrc,
    cardsRemaining = 52,
    totalCards = 52,
}) {
    const backMap = useTexture(backSrc);

    useLayoutEffect(() => {
        configureCardTexture(backMap);
    }, [backMap]);

    const fillRatio = totalCards > 0 ? Math.min(1, cardsRemaining / totalCards) : 1;
    const stackHeight = Math.max(0.045, fillRatio * FULL_STACK_HEIGHT);
    const topLayers = useMemo(
        () =>
            Array.from({ length: Math.min(6, Math.max(2, Math.round(fillRatio * 8))) }, (_, index) => ({
                y: stackHeight + index * CARD_THICKNESS * 0.85,
                rotZ: (index - 2) * 0.018 + (index % 2 === 0 ? 0.008 : -0.006),
                slideX: (index % 3 - 1) * 0.006,
                slideZ: ((index * 1.7) % 3 - 1) * 0.005,
            })),
        [fillRatio, stackHeight],
    );

    if (cardsRemaining <= 0) {
        return null;
    }

    return (
        <group position={position} rotation={[0, 0.42, 0]}>
            {/* Shoe platform */}
            <mesh position={[0, -0.018, 0.14]} castShadow receiveShadow>
                <boxGeometry args={[CARD_WIDTH * 1.22, 0.036, CARD_HEIGHT * 0.62]} />
                <meshStandardMaterial color="#2a160c" roughness={0.62} metalness={0.08} />
            </mesh>

            {/* Shoe back & side walls */}
            <mesh position={[0, stackHeight * 0.35 + 0.02, -CARD_HEIGHT * 0.38]} castShadow receiveShadow>
                <boxGeometry args={[CARD_WIDTH * 1.18, stackHeight * 0.75 + 0.06, 0.05]} />
                <meshStandardMaterial color="#4a2818" roughness={0.55} metalness={0.06} />
            </mesh>
            <mesh position={[-CARD_WIDTH * 0.54, stackHeight * 0.28, 0.02]} castShadow receiveShadow>
                <boxGeometry args={[0.04, stackHeight * 0.6 + 0.04, CARD_HEIGHT * 0.88]} />
                <meshStandardMaterial color="#4a2818" roughness={0.55} metalness={0.06} />
            </mesh>
            <mesh position={[CARD_WIDTH * 0.54, stackHeight * 0.28, 0.02]} castShadow receiveShadow>
                <boxGeometry args={[0.04, stackHeight * 0.6 + 0.04, CARD_HEIGHT * 0.88]} />
                <meshStandardMaterial color="#4a2818" roughness={0.55} metalness={0.06} />
            </mesh>

            {/* Front lip */}
            <mesh position={[0, 0.012, CARD_HEIGHT * 0.4]} castShadow receiveShadow>
                <boxGeometry args={[CARD_WIDTH * 1.14, 0.028, 0.035]} />
                <meshStandardMaterial color="#3d2012" roughness={0.6} metalness={0.1} />
            </mesh>

            {/* Bulk stack — visible card edges */}
            <mesh position={[0, stackHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[CARD_WIDTH * 0.94, stackHeight, CARD_HEIGHT * 0.9]} />
                <meshStandardMaterial color="#ddd4c4" roughness={0.82} metalness={0.02} />
            </mesh>

            {/* Dark edge accent (paper side) */}
            <mesh position={[CARD_WIDTH * 0.47, stackHeight / 2, 0]}>
                <boxGeometry args={[0.012, stackHeight * 0.98, CARD_HEIGHT * 0.86]} />
                <meshStandardMaterial color="#b8ae9c" roughness={0.9} />
            </mesh>

            {/* Top shuffled cards — fanned slightly */}
            {topLayers.map((layer, index) => (
                <mesh
                    key={index}
                    position={[layer.slideX, layer.y, layer.slideZ]}
                    rotation={[-Math.PI / 2, 0, layer.rotZ]}
                    castShadow
                >
                    <planeGeometry args={[CARD_WIDTH * 0.97, CARD_HEIGHT * 0.97]} />
                    <meshStandardMaterial map={backMap} roughness={0.42} metalness={0.05} />
                </mesh>
            ))}

            {/* Cut card (yellow wedge) when shoe is full enough */}
            {fillRatio > 0.55 && (
                <mesh
                    position={[CARD_WIDTH * 0.38, stackHeight * 0.55, CARD_HEIGHT * 0.08]}
                    rotation={[-Math.PI / 2, 0, 0.35]}
                >
                    <planeGeometry args={[CARD_WIDTH * 0.22, CARD_HEIGHT * 0.32]} />
                    <meshStandardMaterial color="#e6c200" roughness={0.5} metalness={0.12} />
                </mesh>
            )}
        </group>
    );
}
