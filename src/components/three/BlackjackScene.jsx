import { Suspense, useLayoutEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
    ContactShadows,
    Environment,
    OrbitControls,
    PerspectiveCamera,
} from '@react-three/drei';
import facedown from '../../assets/facedown4.jpg';
import { useGameContext } from '../../context';
import { CardHand3D } from './CardHand3D';
import { CasinoTable, TABLE_RADIUS } from './CasinoTable';
import { DeckStack3D } from './DeckStack3D';

function CameraRig() {
    const { camera, size } = useThree();
    const aspect = size.width / size.height;

    useLayoutEffect(() => {
        if (!camera.isPerspectiveCamera) {
            return;
        }

        const distance = aspect > 1.8 ? 9.5 : aspect > 1.2 ? 10.5 : 12;
        camera.position.set(0, distance * 0.72, distance * 0.58);
        camera.fov = aspect > 1.5 ? 52 : 46;
        camera.near = 0.1;
        camera.far = 100;
        camera.lookAt(0, 0, TABLE_RADIUS * 0.28);
        camera.updateProjectionMatrix();
    }, [aspect, camera]);

    return (
        <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI / 2.15}
            minDistance={7}
            maxDistance={14}
            target={[0, 0, TABLE_RADIUS * 0.28]}
        />
    );
}

function SceneContents() {
    const {
        playerCards,
        dealerCards,
        showHoleCard,
        cardsRemaining,
        isDeckShuffled,
    } = useGameContext();

    const hasCards = playerCards.length > 0 || dealerCards.length > 0;

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 7, 6]} fov={50} />
            <CameraRig />

            <ambientLight intensity={0.35} />
            <directionalLight
                castShadow
                intensity={1.1}
                position={[4, 10, 4]}
                shadow-mapSize={[2048, 2048]}
            />
            <pointLight intensity={0.45} position={[-4, 5, 3]} color="#ffd9a0" />
            <spotLight
                intensity={0.65}
                angle={0.45}
                penumbra={0.5}
                position={[0, 10, 2]}
                castShadow
            />

            <Environment preset="lobby" />

            <CasinoTable />

            {isDeckShuffled && (
                <DeckStack3D
                    position={[TABLE_RADIUS * 0.72, 0, -0.8]}
                    backSrc={facedown}
                    cardCount={Math.max(3, Math.floor(cardsRemaining / 6))}
                />
            )}

            {hasCards && (
                <>
                    <CardHand3D
                        handId="dealer"
                        cards={dealerCards}
                        backSrc={facedown}
                        zPosition={-0.35}
                        showHoleCard={showHoleCard}
                        holeCardIndex={1}
                        dealOffset={0}
                    />
                    <CardHand3D
                        handId="player"
                        cards={playerCards}
                        backSrc={facedown}
                        zPosition={TABLE_RADIUS * 0.48}
                        showHoleCard
                        holeCardIndex={-1}
                        dealOffset={dealerCards.length}
                    />
                </>
            )}

            <ContactShadows
                position={[0, 0.005, 1.5]}
                opacity={0.5}
                scale={TABLE_RADIUS * 2.4}
                blur={2.5}
                far={8}
            />
        </>
    );
}

function SceneLoader() {
    return (
        <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#0f4536" wireframe />
        </mesh>
    );
}

export function BlackjackScene() {
    return (
        <Canvas
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true }}
            style={{ width: '100%', height: '100%' }}
        >
            <Suspense fallback={<SceneLoader />}>
                <SceneContents />
            </Suspense>
        </Canvas>
    );
}
