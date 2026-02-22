"use client";

import * as THREE from "three";
import { Instances, Instance } from "@react-three/drei";
import { useMemo } from "react";

// Shared Geometry for all Lego studs to maximize performance
const studGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
const studMaterial = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.2,
    metalness: 0.1,
});

// A manageable unit size for bricks
const UNIT = 1;

/**
 * Renders a single Lego brick with studs using Instancing for studs if possible,
 * but for simplicity in complex shapes, we might just use primitives.
 * For the "World" we want highly optimized instanced bricks.
 */

// --- Materials ---
// Plastic-like LEGO materials
export const LegoMaterials = {
    red: new THREE.MeshStandardMaterial({ color: "#ef4444", roughness: 0.1, metalness: 0.0 }),
    blue: new THREE.MeshStandardMaterial({ color: "#3b82f6", roughness: 0.1, metalness: 0.0 }),
    yellow: new THREE.MeshStandardMaterial({ color: "#fbbf24", roughness: 0.1, metalness: 0.0 }),
    green: new THREE.MeshStandardMaterial({ color: "#22c55e", roughness: 0.1, metalness: 0.0 }),
    white: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.1, metalness: 0.0 }),
    black: new THREE.MeshStandardMaterial({ color: "#18181b", roughness: 0.1, metalness: 0.0 }),
    grey: new THREE.MeshStandardMaterial({ color: "#71717a", roughness: 0.1, metalness: 0.0 }),
    transparent: new THREE.MeshPhysicalMaterial({
        color: "#a5f3fc",
        roughness: 0,
        metalness: 0.1,
        transmission: 0.9,
        thickness: 1
    })
};

// --- Low-Cost Procedural Assets ---

export function LegoBasePlate({ width = 100, depth = 100, color = "#10b981" }: { width?: number, depth?: number, color?: string }) {
    // A large flat plate.
    // Instead of thousands of cylinders, we use a normal map or just a texture pattern for the floor 
    // to save massive FPS.
    // But user wants "Lego" vibes, so let's use a simple grid texture.

    // Create a procedural stud texture?
    // Actually, for a 100x100 area, real geometry studs might be too heavy (10,000 instances).
    // Let's stick to a flat plane with a "Stud" normal map logic or just simple shading.

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <boxGeometry args={[width, depth, 0.2]} />
            <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
    );
}

export function LegoTree({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Trunk */}
            <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[0.8, 2, 0.8]} />
                <primitive object={LegoMaterials.black} attach="material" color="#451a03" />
            </mesh>
            {/* Leaves Layers */}
            <mesh position={[0, 2, 0]} castShadow>
                <boxGeometry args={[3, 0.8, 3]} />
                <primitive object={LegoMaterials.green} attach="material" />
            </mesh>
            <mesh position={[0, 2.8, 0]} castShadow>
                <boxGeometry args={[2, 0.8, 2]} />
                <primitive object={LegoMaterials.green} attach="material" />
            </mesh>
            <mesh position={[0, 3.6, 0]} castShadow>
                <boxGeometry args={[1, 0.8, 1]} />
                <primitive object={LegoMaterials.green} attach="material" />
            </mesh>
            {/* Stud on top */}
            <mesh position={[0, 4.1, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
                <primitive object={LegoMaterials.green} attach="material" />
            </mesh>
        </group>
    );
}

export function LegoBuilding({ position, height = 10, color = "white" }: { position: [number, number, number], height?: number, color?: string }) {
    // Stack of randomly colored bricks?
    return (
        <group position={position}>
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[4, height, 4]} />
                <meshStandardMaterial color={color} roughness={0.1} />
            </mesh>
            {/* Roof Studs */}
            {[
                [-1, -1], [1, -1], [-1, 1], [1, 1]
            ].map(([x, z], i) => (
                <mesh key={i} position={[x, height + 0.1, z]}>
                    <cylinderGeometry args={[0.8, 0.8, 0.2, 16]} />
                    <meshStandardMaterial color={color} roughness={0.1} />
                </mesh>
            ))}
        </group>
    );
}
