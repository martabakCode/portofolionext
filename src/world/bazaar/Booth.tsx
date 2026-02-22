'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { interactionSystem } from '@/core/InteractionSystem';
import { BoothConfig } from './BoothData';

interface BoothProps {
    config: BoothConfig;
}

export function Booth({ config }: BoothProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    // Register interaction zone on mount
    useEffect(() => {
        if (!groupRef.current) return;

        interactionSystem.register({
            id: config.id,
            position: new THREE.Vector3(...config.position),
            radius: 4, // Interaction radius
            promptText: `Inspect ${config.title}`,
            onInteract: () => {
                useGameStore.getState().openBazaarBooth(config.id, config);
            },
            onEnter: () => setHovered(true),
            onExit: () => setHovered(false)
        });

        return () => {
            interactionSystem.unregister(config.id);
        };
    }, [config]);

    // Floating animation for banner
    useFrame((state) => {
        if (groupRef.current) {
            // Subtle float logic if needed
        }
    });

    return (
        <group ref={groupRef} position={config.position} rotation={config.rotation}>
            {/* --- STRUCTURE (Wood) --- */}

            {/* Base/Floor */}
            <mesh position={[0, 0.1, 0]} receiveShadow>
                <boxGeometry args={[4, 0.2, 3]} />
                <meshStandardMaterial color="#A8A29E" />
            </mesh>

            {/* Pillars */}
            <mesh position={[-1.8, 1.5, -1.3]} castShadow>
                <boxGeometry args={[0.2, 3, 0.2]} />
                <meshStandardMaterial color="#78350f" />
            </mesh>
            <mesh position={[1.8, 1.5, -1.3]} castShadow>
                <boxGeometry args={[0.2, 3, 0.2]} />
                <meshStandardMaterial color="#78350f" />
            </mesh>
            <mesh position={[-1.8, 1.5, 1.3]} castShadow>
                <boxGeometry args={[0.2, 3, 0.2]} />
                <meshStandardMaterial color="#78350f" />
            </mesh>
            <mesh position={[1.8, 1.5, 1.3]} castShadow>
                <boxGeometry args={[0.2, 3, 0.2]} />
                <meshStandardMaterial color="#78350f" />
            </mesh>

            {/* Counter */}
            <mesh position={[0, 1, 0.5]} castShadow>
                <boxGeometry args={[3.8, 1, 1]} />
                <meshStandardMaterial color="#d97706" />
            </mesh>

            {/* Roof (Cloth/Awning) */}
            <mesh position={[0, 3.2, 0]} rotation={[0.1, 0, 0]}>
                <boxGeometry args={[4.2, 0.2, 3.5]} />
                <meshStandardMaterial color="#FCD34D" />
            </mesh>

            {/* --- TECH ELEMENTS --- */}

            {/* Monitor Main */}
            <group position={[0, 1.8, 0.6]} rotation={[-0.1, 0, 0]}>
                <mesh>
                    <boxGeometry args={[1.5, 0.9, 0.1]} />
                    <meshStandardMaterial color="#1f2937" />
                </mesh>
                {/* Screen Content */}
                <mesh position={[0, 0, 0.06]}>
                    <planeGeometry args={[1.4, 0.8]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>
                {/* Default Text on Screen */}
                <Text
                    position={[0, 0, 0.07]}
                    fontSize={0.1}
                    color="#4ade80"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={1.3}
                >
                    {config.title}
                </Text>
            </group>

            {/* Holographic Banner (Floating) */}
            <group position={[0, 4, 0]}>
                <Text
                    fontSize={0.3}
                    color={hovered ? "#ffff00" : "#ffffff"}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {config.title}
                </Text>
                <Text
                    position={[0, -0.4, 0]}
                    fontSize={0.15}
                    color="#cccccc"
                    anchorX="center"
                    anchorY="middle"
                >
                    {config.type.toUpperCase()}
                </Text>
            </group>

            {/* Tech Stack Icons (Mock) */}
            <group position={[0, 1.2, 1.1]} rotation={[-Math.PI / 4, 0, 0]}>
                {config.techStack.slice(0, 3).map((tech, i) => (
                    <mesh key={i} position={[(i - 1) * 0.4, 0, 0]}>
                        <boxGeometry args={[0.3, 0.3, 0.05]} />
                        <meshStandardMaterial color="#3b82f6" />
                    </mesh>
                ))}
            </group>

        </group>
    );
}
