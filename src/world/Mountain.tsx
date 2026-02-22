'use client';

import { useMemo, useRef } from 'react';
import { Mesh, MeshStandardMaterial } from 'three';
import { useLayoutEffect } from 'react';
import * as THREE from 'three';

interface MountainProps {
    position?: [number, number, number];
}

const Mountain: React.FC<MountainProps> = ({ position = [0, 30, -60] }) => {
    const meshRef = useRef<Mesh>(null);

    useLayoutEffect(() => {
        if (!meshRef.current) return;

        const geometry = meshRef.current.geometry;
        const positionAttribute = geometry.getAttribute('position');
        const vertex = new THREE.Vector3();

        // Noise variation for mountain shape
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);

            // Don't displace bottom vertices too much to keep base flat
            if (vertex.y > 0) {
                const noise = Math.sin(vertex.x * 0.5) * Math.sin(vertex.z * 0.5) * 2;
                vertex.x += (Math.random() - 0.5) * 5;
                vertex.z += (Math.random() - 0.5) * 5;
                vertex.y += (Math.random() - 0.2) * 3;
            }

            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        geometry.computeVertexNormals();
        positionAttribute.needsUpdate = true;
    }, []);

    return (
        <mesh
            ref={meshRef}
            position={position}
            castShadow
            receiveShadow
            name="mountain"
        >
            <coneGeometry args={[30, 60, 32, 16]} />
            <meshStandardMaterial
                color="#78716c" // Stone
                roughness={0.9}
                flatShading={true}
            />
        </mesh>
    );
};

export default Mountain;
