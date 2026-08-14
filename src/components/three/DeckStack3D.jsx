import { useTexture } from '@react-three/drei';
import { CARD_HEIGHT, CARD_LIFT, CARD_WIDTH } from './PlayingCard3D';

export function DeckStack3D({ position = [3.4, 0, -2.4], cardCount = 8, backSrc }) {
    const stackCount = Math.min(cardCount, 12);
    const backMap = useTexture(backSrc);

    return (
        <group position={position}>
            {Array.from({ length: stackCount }, (_, index) => (
                <mesh
                    key={index}
                    position={[0, CARD_LIFT + index * 0.004, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    castShadow
                >
                    <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                    <meshStandardMaterial
                        map={backMap}
                        roughness={0.45}
                        metalness={0.05}
                    />
                </mesh>
            ))}
        </group>
    );
}
