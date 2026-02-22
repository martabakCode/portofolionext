"use client";

import { useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import * as THREE from "three";

interface DeviceScreenProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    type: "tv" | "phone" | "laptop" | "tablet" | "billboard";
    title: string;
    children: React.ReactNode;
    onClick?: () => void;
}

export default function DeviceScreen({
    position,
    rotation = [0, 0, 0],
    type,
    title,
    children,
    onClick
}: DeviceScreenProps) {
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    // Dimensions configuration
    const config = {
        tv: { width: 6, height: 3.5, depth: 0.3, bezel: 0.2, htmlScale: 4, pixelWidth: 640, pixelHeight: 360 },
        phone: { width: 1.5, height: 3, depth: 0.15, bezel: 0.1, htmlScale: 2, pixelWidth: 270, pixelHeight: 540 },
        tablet: { width: 4, height: 3, depth: 0.15, bezel: 0.2, htmlScale: 3, pixelWidth: 500, pixelHeight: 375 },
        laptop: { width: 5, height: 3, depth: 0.1, bezel: 0.2, htmlScale: 3, pixelWidth: 600, pixelHeight: 360 },
        billboard: { width: 10, height: 5, depth: 0.5, bezel: 0.3, htmlScale: 6, pixelWidth: 800, pixelHeight: 400 },
    }[type];

    const { width, height, depth, bezel, htmlScale, pixelWidth, pixelHeight } = config;

    return (
        <group position={position} rotation={rotation}>
            {/* Device Body / Frame */}
            <mesh
                castShadow
                receiveShadow
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={onClick}
            >
                <boxGeometry args={[width + bezel, height + bezel, depth]} />
                <meshStandardMaterial
                    color={type === "billboard" ? "#52525b" : "#27272a"}
                    metalness={0.6}
                    roughness={0.4}
                />
            </mesh>

            {/* Screen Bezel (Inner black frame) */}
            <mesh position={[0, 0, depth / 2 + 0.01]}>
                <boxGeometry args={[width, height, 0.02]} />
                <meshStandardMaterial color="#000000" />
            </mesh>

            {/* Screen Display (Black background behind content) */}
            <mesh position={[0, 0, depth / 2 + 0.02]}>
                <planeGeometry args={[width - 0.1, height - 0.1]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* HTML Content */}
            <Html
                transform
                position={[0, 0, depth / 2 + 0.03]}
                distanceFactor={htmlScale}
                style={{
                    width: `${pixelWidth}px`,
                    height: `${pixelHeight}px`,
                    pointerEvents: hovered ? 'auto' : 'none',
                }}
                occlude
            >
                <div className={`bg-zinc-900 overflow-hidden select-none w-full h-full flex flex-col ${type === "tv" || type === "billboard" ? 'rounded-none' : 'rounded-lg'
                    }`} style={{
                        border: (type === 'tv' || type === 'billboard') ? 'none' : '4px solid #3f3f46'
                    }}>
                    {/* Header Bar (Mac-like or simple) */}
                    <div className="bg-zinc-800 flex items-center justify-between px-3 py-2 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            {(type === "tv" || type === "laptop" || type === "billboard") ? (
                                <>
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </>
                            ) : (
                                <div className="w-8 h-1 rounded-full bg-zinc-600" />
                            )}
                        </div>
                        <span className="text-zinc-400 font-medium text-xs truncate max-w-[150px]">
                            {title}
                        </span>
                        <div className="w-6" />
                    </div>

                    {/* Content Area */}
                    <div className="p-3 overflow-auto flex-1 relative text-left">
                        {children}
                    </div>
                </div>
            </Html>

            {/* Extra Parts for Specific Devices */}

            {/* TV Stand */}
            {type === "tv" && (
                <group position={[0, -height / 2 - 0.2, 0]}>
                    <mesh position={[0, -0.4, -0.1]} castShadow>
                        <boxGeometry args={[0.5, 0.8, 0.3]} />
                        <meshStandardMaterial color="#27272a" />
                    </mesh>
                    <mesh position={[0, -0.8, -0.1]} castShadow>
                        <boxGeometry args={[2.5, 0.1, 1.5]} />
                        <meshStandardMaterial color="#18181b" />
                    </mesh>
                </group>
            )}

            {/* Phone Home Button & Camera */}
            {type === "phone" && (
                <>
                    <mesh position={[0, -height / 2 - 0.2, depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
                        <meshStandardMaterial color="#3f3f46" />
                    </mesh>
                    <mesh position={[0, height / 2 + 0.2, depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
                        <meshStandardMaterial color="#000000" />
                    </mesh>
                </>
            )}

            {/* Laptop Base (Keyboard) */}
            {type === "laptop" && (
                <group rotation={[Math.PI / 2.5, 0, 0]} position={[0, -height / 2 + 0.1, 0]}>
                    <mesh position={[0, -height / 2, 0]} castShadow>
                        <boxGeometry args={[width + 0.2, height + 0.5, 0.2]} />
                        <meshStandardMaterial color="#A8A29E" metalness={0.5} roughness={0.2} />
                    </mesh>
                    {/* Trackpad - Sunk */}
                    <mesh position={[0, -height / 2 - 1, 0.11]}>
                        <planeGeometry args={[1.5, 1]} />
                        <meshStandardMaterial color="#78716c" />
                    </mesh>
                    {/* Keyboard area - Raised keys block, simplified */}
                    <mesh position={[0, -height / 2 + 0.5, 0.11]}>
                        <boxGeometry args={[width - 0.5, 1.5, 0.05]} />
                        <meshStandardMaterial color="#44403c" />
                    </mesh>
                </group>
            )}

            {/* Tablet Home Button */}
            {type === "tablet" && (
                <mesh position={[width / 2 + 0.3, 0, depth / 2]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
                    <meshStandardMaterial color="#3f3f46" />
                </mesh>
            )}

            {/* Billboard Posts */}
            {type === "billboard" && (
                <group position={[0, -height / 2, -depth / 2]}>
                    <mesh position={[-width / 3, -3, 0]} castShadow>
                        <cylinderGeometry args={[0.2, 0.2, 6, 8]} />
                        <meshStandardMaterial color="#71717a" metalness={0.8} />
                    </mesh>
                    <mesh position={[width / 3, -3, 0]} castShadow>
                        <cylinderGeometry args={[0.2, 0.2, 6, 8]} />
                        <meshStandardMaterial color="#71717a" metalness={0.8} />
                    </mesh>
                </group>
            )}

            {/* Glow / Selection Highlight */}
            {hovered && (
                <mesh position={[0, 0, -0.1]}>
                    <boxGeometry args={[width + bezel + 0.2, height + bezel + 0.2, depth]} />
                    <meshBasicMaterial color="#4f46e5" transparent opacity={0.2} />
                </mesh>
            )}
        </group>
    );
}
