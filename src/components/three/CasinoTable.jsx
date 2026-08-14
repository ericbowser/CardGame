import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import tableModelUrl from '../../assets/blackjack_table.glb';
import { updateTableLayout } from './tableLayout';

export const TABLE_RADIUS = 7.5;
const TARGET_WIDTH = 10;
/** World-space height for the felt surface after fit. */
const FELT_SURFACE_Y = 0.72;
/** This Sketchfab GLB already faces +Z; player curve toward camera needs no Y spin. */
const TABLE_Y_ROTATION = 0;

useGLTF.preload(tableModelUrl);

function fitTableToScene(table) {
    table.rotation.set(0, 0, 0);
    table.scale.set(1, 1, 1);
    table.position.set(0, 0, 0);
    table.updateMatrixWorld(true);

    let box = new THREE.Box3().setFromObject(table);
    let size = box.getSize(new THREE.Vector3());

    // Lay flat if the model was exported standing upright.
    if (size.y > size.x * 1.2 && size.y > size.z * 1.2) {
        table.rotation.x = -Math.PI / 2;
        table.updateMatrixWorld(true);
        box = new THREE.Box3().setFromObject(table);
        size = box.getSize(new THREE.Vector3());
    }

    // Face the player edge toward +Z.
    table.rotation.y = TABLE_Y_ROTATION;
    table.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(table);
    size = box.getSize(new THREE.Vector3());

    const scale = TARGET_WIDTH / Math.max(size.x, size.z, 0.001);
    table.scale.setScalar(scale);
    table.updateMatrixWorld(true);

    box = new THREE.Box3().setFromObject(table);
    const center = box.getCenter(new THREE.Vector3());
    // Align felt to a fixed height; pedestal extends below y = 0.
    table.position.set(-center.x, -box.max.y + FELT_SURFACE_Y, -center.z);
    table.updateMatrixWorld(true);

    box = new THREE.Box3().setFromObject(table);
    const depth = box.max.z - box.min.z;
    const width = box.max.x - box.min.x;
    const topY = box.max.y + 0.015;

    updateTableLayout({
        topY,
        dealerZ: box.min.z + depth * 0.28,
        playerZ: box.min.z + depth * 0.66,
        deckPosition: [box.min.x + width * 0.78, topY + 0.02, box.min.z + depth * 0.22],
        radius: Math.max(size.x, size.z) * scale * 0.5,
    });
}

export function CasinoTable() {
    const { scene } = useGLTF(tableModelUrl);
    const table = useMemo(() => scene.clone(true), [scene]);

    useLayoutEffect(() => {
        table.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        fitTableToScene(table);
    }, [table]);

    return <primitive object={table} />;
}
