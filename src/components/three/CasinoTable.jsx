import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const TABLE_RADIUS = 7.5;
const RAIL_WIDTH = 0.35;

function createSemicircleGeometry(radius, segments = 64) {
    return new THREE.CircleGeometry(radius, segments, Math.PI, Math.PI);
}

function createSemicircleRingGeometry(innerRadius, outerRadius) {
    const shape = new THREE.Shape();
    shape.moveTo(-outerRadius, 0);
    shape.absarc(0, 0, outerRadius, Math.PI, 0, false);
    shape.lineTo(innerRadius, 0);
    shape.absarc(0, 0, innerRadius, 0, Math.PI, true);
    shape.lineTo(-outerRadius, 0);

    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(-Math.PI / 2);
    return geometry;
}

function SemicircleMesh({ radius, material, y = 0, castShadow, receiveShadow }) {
    const geometry = useMemo(() => createSemicircleGeometry(radius), [radius]);

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, y, 0]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
            geometry={geometry}
            material={material}
        />
    );
}

export function CasinoTable() {
    const railGeometry = useMemo(
        () => createSemicircleRingGeometry(TABLE_RADIUS, TABLE_RADIUS + RAIL_WIDTH),
        []
    );

    const goldRingGeometry = useMemo(
        () => createSemicircleRingGeometry(TABLE_RADIUS - 0.2, TABLE_RADIUS - 0.02),
        []
    );

    const feltRadius = TABLE_RADIUS - 0.15;

    return (
        <group>
            <mesh
                geometry={railGeometry}
                position={[0, -0.08, 0]}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial color="#141010" roughness={0.55} metalness={0.25} />
            </mesh>

            <SemicircleMesh
                radius={TABLE_RADIUS}
                y={0.001}
                receiveShadow
                material={
                    <meshStandardMaterial color="#0a2a21" roughness={0.96} metalness={0.02} />
                }
            />

            <SemicircleMesh
                radius={feltRadius}
                y={0.003}
                receiveShadow
                material={
                    <meshStandardMaterial color="#0f4536" roughness={0.94} metalness={0.03} />
                }
            />

            <mesh geometry={goldRingGeometry} position={[0, 0.004, 0]} receiveShadow>
                <meshStandardMaterial color="#c9a227" roughness={0.45} metalness={0.55} />
            </mesh>

            <Text
                position={[0, 0.02, -0.55]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.16}
                color="#8ab5a8"
                anchorX="center"
                anchorY="middle"
            >
                DEALER
            </Text>

            <Text
                position={[0, 0.02, 3.8]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.16}
                color="#8ab5a8"
                anchorX="center"
                anchorY="middle"
            >
                PLAYER
            </Text>
        </group>
    );
}
