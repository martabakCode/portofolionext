"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Instances, Instance } from "@react-three/drei";

// Coastal World Palette
const COASTAL_PALETTE = [
    "#FCA5A5", // light red/coral
    "#FDBA74", // orange
    "#FDE047", // yellow
    "#86EFAC", // green
    "#67E8F9", // cyan
    "#93C5FD", // blue
    "#C4B5FD", // violet
    "#F0ABFC", // fuchsia
    "#FDA4AF", // rose
];

const ACCENT_COLORS = [
    "#FFFFFF", // white
    "#1F2937", // dark grey
    "#FCD34D", // amber
];

// --- Buildings (Floating Island Style) ---

export function CoastalBuilding({ position, scale = [1, 1, 1], color = "#FCA5A5" }: { position: [number, number, number], scale?: [number, number, number], color?: string }) {

    const height = 15 * scale[1];
    const width = 6 * scale[0];
    const depth = 6 * scale[2];

    // Select an accent color
    const accent = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];

    return (
        <group position={position}>
            {/* Floating Island Base */}
            <mesh position={[0, -2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[width * 0.8, width * 0.4, 4, 7]} />
                <meshStandardMaterial color="#A8A29E" roughness={0.8} />
            </mesh>

            {/* Main Body */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial color={color} roughness={0.05} metalness={0.0} />
            </mesh>

            {/* White Trim / Foundation */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[width + 0.4, 1, depth + 0.4]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} />
            </mesh>

            {/* Roof Rim */}
            <mesh position={[0, height, 0]}>
                <boxGeometry args={[width + 0.6, 0.5, depth + 0.6]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} />
            </mesh>

            {/* Roof Top Structure (AC / Hatch) */}
            <mesh position={[width / 4, height + 1, -depth / 4]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color={accent} roughness={0.1} />
            </mesh>

            {/* Awning over entrance */}
            <group position={[0, 3.5, depth / 2 + 0.5]}>
                <mesh rotation={[0.4, 0, 0]}>
                    <boxGeometry args={[width * 0.6, 0.2, 2]} />
                    <meshStandardMaterial color={accent} />
                </mesh>
                {/* Awning Supports */}
                <mesh position={[-width * 0.25, -1, 0.8]} rotation={[0, 0, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 2]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                <mesh position={[width * 0.25, -1, 0.8]} rotation={[0, 0, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 2]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>

        </group>
    );
}

// Adapter for World.tsx
export function Building({ position, scale = [1, 1, 1], color }: { position: [number, number, number], scale?: [number, number, number], color?: string }) {
    const paletteColor = color || COASTAL_PALETTE[Math.floor(Math.abs(position[0] + position[2]) % COASTAL_PALETTE.length)];
    // Add floating wobble if desired, for now static floating look
    return <CoastalBuilding position={position} scale={scale} color={paletteColor} />;
}

export function BuildingInstances({ buildings }: { buildings: any[] }) {
    return (
        <group>
            {buildings.map((b, i) => (
                <CoastalBuilding
                    key={i}
                    position={b.position}
                    scale={b.scale}
                    color={b.color || COASTAL_PALETTE[i % COASTAL_PALETTE.length]}
                />
            ))}
        </group>
    );
}


// --- Nature / Environment ---

export function PalmTree({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Floating dirt patch */}
            <mesh position={[0, -1, 0]}>
                <cylinderGeometry args={[1.5, 0.5, 2, 6]} />
                <meshStandardMaterial color="#78350f" />
            </mesh>

            {/* Trunk - Curved Segmented */}
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.4, 2, 7]} />
                <meshStandardMaterial color="#D97706" roughness={1} />
            </mesh>
            <mesh position={[0.2, 2.8, 0]} rotation={[0, 0, -0.2]} castShadow>
                <cylinderGeometry args={[0.25, 0.3, 2, 7]} />
                <meshStandardMaterial color="#D97706" roughness={1} />
            </mesh>
            <mesh position={[0.5, 4.5, 0]} rotation={[0, 0, -0.4]} castShadow>
                <cylinderGeometry args={[0.2, 0.25, 2, 7]} />
                <meshStandardMaterial color="#D97706" roughness={1} />
            </mesh>

            {/* Leaves - Star Shape */}
            <group position={[0.8, 5.5, 0]}>
                {[...Array(7)].map((_, i) => (
                    <mesh key={i} rotation={[0.5, (i / 7) * Math.PI * 2, 0]} position={[0, 0, 0]} castShadow>
                        <boxGeometry args={[0.5, 0.1, 3]} />
                        <meshStandardMaterial color="#4ADE80" roughness={0.3} />
                    </mesh>
                ))}
                <mesh position={[0, 0.1, 0]}>
                    <sphereGeometry args={[0.4]} />
                    <meshStandardMaterial color="#D97706" />
                </mesh>
            </group>
        </group>
    );
}

export function PalmTreeInstances({ trees }: { trees: any[] }) {
    // Simplified instancing for performance
    return (
        <group>
            {/* Dirt Base */}
            <Instances range={trees.length} castShadow receiveShadow>
                <cylinderGeometry args={[1.5, 0.5, 2, 6]} />
                <meshStandardMaterial color="#78350f" />
                {trees.map((t, i) => <Instance key={i} position={[t.position[0], -1, t.position[2]]} />)}
            </Instances>

            {/* Simplified trunk for instances */}
            <Instances range={trees.length} castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.5, 5, 5]} />
                <meshStandardMaterial color="#D97706" roughness={1} />
                {trees.map((t, i) => <Instance key={i} position={[t.position[0], 2.5, t.position[2]]} rotation={[0.1, Math.random() * Math.PI, 0]} />)}
            </Instances>

            {/* Foliage Canopy */}
            <Instances range={trees.length} castShadow receiveShadow>
                <coneGeometry args={[3, 2, 7]} />
                <meshStandardMaterial color="#4ADE80" roughness={0.2} />
                {trees.map((t, i) => <Instance key={i} position={[t.position[0], 5, t.position[2]]} />)}
            </Instances>
        </group>
    );
}


export function GrassCluster({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[0.4, 5]} />
                <meshStandardMaterial color="#86EFAC" transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
                <coneGeometry args={[0.1, 0.4, 3]} />
                <meshStandardMaterial color="#86EFAC" />
            </mesh>
        </group>
    )
}

export function Water({ position, args }: { position: [number, number, number], args: [number, number] }) {
    return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={args} />
            <meshStandardMaterial
                color="#67E8F9"
                roughness={0.1}
                metalness={0.1}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
}

export function MountainRange({ count = 10, radius = 200, center = [0, 0, -100] }: { count?: number, radius?: number, center?: [number, number, number] }) {
    // Pastel Floating Mountains
    const mountains = useMemo(() => {
        return [...Array(count)].map((_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const dist = radius + (Math.random() - 0.5) * 50;
            return {
                position: [center[0] + Math.sin(angle) * dist, 5 + Math.random() * 10, center[2] + Math.cos(angle) * dist],
                scale: 8 + Math.random() * 8,
                color: ["#FCA5A5", "#E5E7EB", "#C4B5FD"][Math.floor(Math.random() * 3)]
            }
        })
    }, [count, radius, center]);

    return (
        <group>
            {mountains.map((m, i) => (
                <group key={i} position={m.position as any}>
                    {/* Floating Base */}
                    <mesh position={[0, -m.scale * 2, 0]} rotation={[Math.PI, 0, 0]}>
                        <coneGeometry args={[m.scale * 3, m.scale * 4, 6]} />
                        <meshStandardMaterial color="#78716c" roughness={1} />
                    </mesh>
                    <mesh>
                        <coneGeometry args={[m.scale * 3, m.scale * 4, 32]} />
                        <meshStandardMaterial color={m.color} roughness={1} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

export function Skyline({ count = 20 }: { count?: number }) {
    // Distant pastel city
    const buildings = useMemo(() => {
        return [...Array(count)].map((_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const radius = 150 + Math.random() * 100;
            return {
                position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius],
                height: 30 + Math.random() * 50,
                width: 10 + Math.random() * 10,
                color: COASTAL_PALETTE[Math.floor(Math.random() * COASTAL_PALETTE.length)]
            };
        });
    }, [count]);

    return (
        <group>
            {buildings.map((b, i) => (
                <mesh key={i} position={[b.position[0], b.height / 2 - 10, b.position[2]]}>
                    <boxGeometry args={[b.width, b.height, b.width]} />
                    <meshBasicMaterial color={b.color} opacity={0.8} transparent />
                </mesh>
            ))}
            {/* Fog hider ring to blend horizon */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                <ringGeometry args={[140, 300, 32]} />
                <meshBasicMaterial color="#dbeafe" transparent opacity={0.9} />
            </mesh>
        </group>
    )
}


// --- Props/Decorations ---

export function Shop({ position, rotation, color = "#FDE047", signColor = "#F97316" }: any) {
    // A nice beach hut shop on stilts/island
    return (
        <group position={position} rotation={rotation}>
            <mesh position={[0, -1, 0]}>
                <cylinderGeometry args={[5, 1, 2, 7]} />
                <meshStandardMaterial color="#A8A29E" />
            </mesh>
            <CoastalBuilding position={[0, 0.4, 0]} scale={[1, 0.4, 1]} color={color} />
        </group>
    )
}

export function MarketStall({ position, rotation, roofColor = "#F472B6" }: any) {
    return (
        <group position={position} rotation={rotation}>
            <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[3, 3, 0.2]} />
                <meshStandardMaterial color="white" />
            </mesh>
            {/* Striped Roof - Simplified as solid color for now */}
            <mesh position={[0, 2.8, 1.2]} rotation={[0.5, 0, 0]}>
                <boxGeometry args={[3.2, 0.1, 2.5]} />
                <meshStandardMaterial color={roofColor} />
            </mesh>
            {/* Counter */}
            <mesh position={[0, 1, 1]}>
                <boxGeometry args={[3, 1, 1]} />
                <meshStandardMaterial color="#FDBA74" />
            </mesh>
        </group>
    )
}

export function Lantern({ position, color = "#FCD34D" }: any) {
    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
            </mesh>
            <pointLight distance={10} intensity={1} color={color} />
        </group>
    )
}

export function LightPost({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 3, 0]}>
                <cylinderGeometry args={[0.1, 0.2, 6, 8]} />
                <meshStandardMaterial color="#4B5563" />
            </mesh>
            <mesh position={[0, 6, 0.5]}>
                <sphereGeometry args={[0.4]} />
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
            </mesh>
            <pointLight position={[0, 6, 0.5]} distance={15} intensity={1} color="#FEF3C7" />
        </group>
    )
}

export function Crate({ position, rotation }: any) {
    return (
        <mesh position={position} rotation={rotation}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#D97706" />
        </mesh>
    )
}

export function Barrel({ position, rotation }: any) {
    return (
        <mesh position={position} rotation={rotation}>
            <cylinderGeometry args={[0.6, 0.6, 1.2, 8]} />
            <meshStandardMaterial color="#B45309" />
        </mesh>
    )
}
