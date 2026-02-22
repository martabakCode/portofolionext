'use client';

import React, { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

// --- Beach Rock ---
export function BeachRock({ position, scale = 1, rotation = [0, 0, 0] }: { position: [number, number, number], scale?: number, rotation?: [number, number, number] }) {
    return (
        <mesh position={position} rotation={rotation as any} castShadow receiveShadow>
            <dodecahedronGeometry args={[scale, 0]} />
            <meshStandardMaterial color="#a8a29e" roughness={0.9} />
        </mesh>
    );
}

// --- Starfish ---
export function Starfish({ position, color = "#fca5a5" }: { position: [number, number, number], color?: string }) {
    return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, Math.random()]} receiveShadow>
            <cylinderGeometry args={[0, 0.2, 0.1, 5]} />
            <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
    );
}

// --- Parasol (Umbrella) ---
export function Parasol({ position, color = "#f472b6" }: { position: [number, number, number], color?: string }) {
    return (
        <group position={position}>
            {/* Pole */}
            <mesh position={[0, 1.5, 0]} rotation={[0.1, 0, 0.1]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 3.5]} />
                <meshStandardMaterial color="#fef3c7" />
            </mesh>
            {/* Top */}
            <mesh position={[0.15, 3, 0.15]} rotation={[0.1, 0, 0.1]}>
                <coneGeometry args={[1.5, 0.5, 8]} />
                <meshStandardMaterial color={color} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

// --- Beach Chair ---
export function BeachChair({ position, rotation = [0, 0, 0], color = "#60a5fa" }: { position: [number, number, number], rotation?: [number, number, number], color?: string }) {
    return (
        <group position={position} rotation={rotation as any}>
            {/* Frame */}
            <mesh position={[0, 0.3, 0.2]} rotation={[-0.5, 0, 0]} castShadow>
                <boxGeometry args={[0.6, 0.1, 1]} />
                <meshStandardMaterial color="#e5e7eb" />
            </mesh>
            {/* Fabric */}
            <mesh position={[0, 0.35, 0.2]} rotation={[-0.5, 0, 0]}>
                <boxGeometry args={[0.5, 0.05, 0.9]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Legs */}
            <mesh position={[0.25, 0.2, 0.5]} rotation={[0.2, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.6]} />
                <meshStandardMaterial color="#9ca3af" />
            </mesh>
            <mesh position={[-0.25, 0.2, 0.5]} rotation={[0.2, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.6]} />
                <meshStandardMaterial color="#9ca3af" />
            </mesh>
            <mesh position={[0.25, 0.4, 0]} rotation={[-0.8, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.6]} />
                <meshStandardMaterial color="#9ca3af" />
            </mesh>
            <mesh position={[-0.25, 0.4, 0]} rotation={[-0.8, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.6]} />
                <meshStandardMaterial color="#9ca3af" />
            </mesh>
        </group>
    );
}

// --- Palm Tree (Adapted for Beach) ---
export function BeachPalmTree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
    return (
        <group position={position} scale={[scale, scale, scale]}>
            {/* Trunk - Curved Segmented */}
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.3, 2, 7]} />
                <meshStandardMaterial color="#d97706" roughness={1} />
            </mesh>
            <mesh position={[0.2, 2.5, 0]} rotation={[0, 0, -0.2]} castShadow>
                <cylinderGeometry args={[0.15, 0.2, 2, 7]} />
                <meshStandardMaterial color="#d97706" roughness={1} />
            </mesh>
            <mesh position={[0.5, 4.0, 0]} rotation={[0, 0, -0.4]} castShadow>
                <cylinderGeometry args={[0.1, 0.15, 2, 7]} />
                <meshStandardMaterial color="#d97706" roughness={1} />
            </mesh>

            {/* Leaves - Star Shape */}
            <group position={[0.8, 5.0, 0]}>
                {[...Array(7)].map((_, i) => (
                    <mesh key={i} rotation={[0.5, (i / 7) * Math.PI * 2, 0]} position={[0, 0, 0]} castShadow>
                        <boxGeometry args={[0.5, 0.05, 3.5]} />
                        <meshStandardMaterial color="#4ade80" roughness={0.3} />
                    </mesh>
                ))}
                <mesh position={[0, 0.1, 0]}>
                    <sphereGeometry args={[0.4]} />
                    <meshStandardMaterial color="#d97706" />
                </mesh>
            </group>
        </group>
    );
}

// --- Asset Manager Component ---
export function BeachAssets({ size }: { size: number }) {

    // Simple height function approximation from Beach.tsx
    // h = (beachSlope + duneHeight * flattenFactor) * 0.5
    // Ignoring dune noise for placement stability, approximating slope.
    // Beach.tsx: const beachSlope = Math.max(0, (y + size/2) * 0.015);
    // positions[i + 2] = beachSlope * 0.5; (roughly)
    const getHeight = (x: number, z: number) => {
        // Z in world space was Y in the loop
        const slope = Math.max(0, (z + size / 2) * 0.015);
        return slope * 0.5;
    };

    // Generate Palms (Back of the beach, higher ground)
    const palms = useMemo(() => {
        const items = [];
        const count = 15;
        for (let i = 0; i < count; i++) {
            // Place in outer ring (higher z)
            // Let's assume beach is roughly square/circle of 'size'. 
            // We want them 'inland' -> +Z relative to center?
            // Based on slope logic: +Z is higher.
            const z = (Math.random() * 0.3 + 0.2) * size; // 0.2 to 0.5 * size (Positive Z)
            const x = (Math.random() - 0.5) * size;

            // Check if within reasonable bounds
            if (Math.abs(x) < size / 2 && Math.abs(z) < size / 2) {
                const y = getHeight(x, z);
                items.push({
                    position: [x, y, z] as [number, number, number],
                    scale: 0.8 + Math.random() * 0.4
                });
            }
        }
        return items;
    }, [size]);

    // Generate Rocks (Scattered)
    const rocks = useMemo(() => {
        const items = [];
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * size;
            const z = (Math.random() - 0.5) * size;
            const y = getHeight(x, z);
            items.push({
                position: [x, y + 0.2, z] as [number, number, number],
                scale: 0.5 + Math.random() * 0.8
            });
        }
        return items;
    }, [size]);

    // Generate Props (Parasols & Chairs) - Closer to water (Lower Z)
    const props = useMemo(() => {
        const items = [];
        // Create a few clusters near the "water line" (approx Z = -size/3 to 0 ?)
        // Water edge logic: waterEdge = Math.max(0, y + size/3);
        // If y = -size/3, edge is 0.
        // So Z around -size/3 is the water line.

        for (let c = 0; c < 5; c++) {
            const clusterX = (Math.random() - 0.5) * size * 0.8;
            const clusterZ = -size / 4 + (Math.random() * size * 0.2); // Near mid-low beach
            const clusterY = getHeight(clusterX, clusterZ);

            // Add parasol
            items.push({
                type: 'parasol',
                position: [clusterX, clusterY, clusterZ] as [number, number, number],
                color: ['#f472b6', '#60a5fa', '#fcd34d', '#34d399'][c % 4]
            });

            // Add 1-2 chairs per parasol
            const chairAngle = Math.random() * Math.PI;
            items.push({
                type: 'chair',
                position: [clusterX + 1.2, clusterY, clusterZ] as [number, number, number],
                rotation: [0, chairAngle, 0] as [number, number, number],
                color: ['#f472b6', '#60a5fa', '#fcd34d', '#34d399'][c % 4]
            });
        }
        return items;
    }, [size]);

    const starfish = useMemo(() => {
        const items = [];
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * size;
            const z = -size / 3 + (Math.random() * size * 0.15); // Very close to water
            const y = getHeight(x, z);
            items.push({ position: [x, y + 0.05, z] as [number, number, number] });
        }
        return items;
    }, [size]);

    return (
        <group>
            {palms.map((p, i) => <BeachPalmTree key={`palm-${i}`} position={p.position} scale={p.scale} />)}
            {rocks.map((r, i) => <BeachRock key={`rock-${i}`} position={r.position} scale={r.scale} rotation={[Math.random(), Math.random(), Math.random()]} />)}
            {props.map((p, i) => {
                if (p.type === 'parasol') return <Parasol key={`prop-p-${i}`} position={p.position} color={p.color} />;
                if (p.type === 'chair') return <BeachChair key={`prop-c-${i}`} position={p.position} rotation={p.rotation} color={p.color} />;
                return null;
            })}
            {starfish.map((s, i) => <Starfish key={`star-${i}`} position={s.position} />)}
        </group>
    );
}
