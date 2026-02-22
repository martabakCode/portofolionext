"use client";

import { Text, Html, Image as DreiImage, useCursor } from "@react-three/drei";
import * as THREE from "three";
import type { Post } from "@/modules/posts/posts.types";
import type { Project } from "@/modules/projects/projects.types";
import type { Profile } from "@/modules/profile/profile.types";
import type { Experience } from "@/modules/experience/experience.types";
import type { TechStack } from "@/modules/techstack/techstack.types";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useState, useEffect, useMemo } from "react";
import DeviceScreen from "./DeviceScreen";
import TechItem from "./TechItem";
import { Water, GrassCluster, Skyline, MountainRange, Lantern, Crate, Barrel, LightPost, PalmTreeInstances, BuildingInstances } from "./Environment";
import {
    CollidableBuilding,
    CollidablePalmTree,
    CollidableShop,
    CollidableMarketStall,
    GroundColliders,
} from "@/physics";

interface WorldProps {
    posts: Post[];
    projects: Project[];
    profile: Profile | null;
    experiences: Experience[];
    isDriving: boolean;
    onEnterCar: () => void;
    techStacks: TechStack[];
}

export default function World({ posts, projects, profile, experiences, isDriving, onEnterCar, techStacks }: WorldProps) {
    return (
        <group>
            {/* Ground Colliders for Physics */}
            <GroundColliders />

            {/* Ground - Central Floating Island (Visual) */}
            {/* Main Plaza Island */}
            <mesh position={[0, -2, 0]} receiveShadow>
                <cylinderGeometry args={[120, 100, 4, 64]} />
                <meshStandardMaterial color="#bef264" roughness={1} metalness={0.0} />
            </mesh>
            {/* Dirt/Rock Base for Island */}
            <mesh position={[0, -5, 0]} receiveShadow>
                <cylinderGeometry args={[100, 50, 6, 32]} />
                <meshStandardMaterial color="#78716c" roughness={1} />
            </mesh>

            {/* River - Animated */}
            <Water position={[-40, -0.05, 0]} args={[20, 1000]} />

            {/* Road markings */}
            <RoadMarkings />

            {/* Profile Section (Center) - Welcome Plaza */}
            <group position={[0, 0, -5]}>
                {/* Platform */}
                <mesh position={[0, 0.05, 0]} receiveShadow>
                    <cylinderGeometry args={[6, 6, 0.1, 32]} />
                    <meshStandardMaterial color="#27272a" />
                </mesh>

                {/* Name display */}
                <Text
                    position={[0, 4, 0]}
                    fontSize={1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {profile?.full_name || "Portfolio"}
                </Text>
                <Text
                    position={[0, 3, 0]}
                    fontSize={0.5}
                    color="#4f46e5"
                    anchorX="center"
                    anchorY="middle"
                >
                    {profile?.headline || "Welcome to my 3D World"}
                </Text>

                {/* Info Board */}
                <mesh position={[0, 1.5, 4]} rotation={[0, Math.PI, 0]} castShadow>
                    <boxGeometry args={[5, 2, 0.2]} />
                    <meshStandardMaterial color="#27272a" />
                    <Html transform position={[0, 0, 0.15]} distanceFactor={4}>
                        <div className="w-80 text-center text-white p-4 select-none pointer-events-none">
                            <p className="text-sm text-zinc-300">{profile?.bio || "Explore this 3D portfolio using WASD to move. Find the TV for projects and phone for blog posts!"}</p>
                            <div className="mt-4 flex justify-center gap-2">
                                <span className="px-2 py-1 bg-indigo-600 rounded text-xs">3D Portfolio</span>
                                <span className="px-2 py-1 bg-zinc-700 rounded text-xs">Interactive</span>
                            </div>
                        </div>
                    </Html>
                </mesh>
            </group>

            {/* Skills Section - Left Side */}
            <group position={[-15, 0, -5]}>
                <Text position={[0, 5, 0]} fontSize={1} color="white" anchorX="center">
                    Tech Stack
                </Text>

                <group position={[0, 2, 0.2]}>
                    {techStacks.map((tech, index) => {
                        const col = index % 4;
                        const row = Math.floor(index / 4);
                        return (
                            <TechItem
                                key={tech.id}
                                tech={tech}
                                position={[(col - 1.5) * 2.5, (2 - row) * 1.5, 0]}
                            />
                        );
                    })}
                </group>
            </group>

            {/* Experience Section - Right Side */}
            <group position={[25, 0, -5]}>
                <Text position={[0, 6, 0]} fontSize={1} color="white" anchorX="center">
                    Experience
                </Text>

                {/* Experience Devices: Laptop, Tablet, Billboard */}
                {experiences.map((exp, index) => {
                    // Cycle through device types: Laptop -> Tablet -> Billboard
                    const deviceType = index % 3 === 0 ? "laptop" : (index % 3 === 1 ? "tablet" : "billboard");

                    // Linear layout with ample spacing
                    // Start from 0 and go along Z axis
                    const zPos = (index - (experiences.length - 1) / 2) * 12;

                    // Slight curve for better viewing angle
                    const xPos = Math.abs(zPos) * 0.1;

                    return (
                        <DeviceScreen
                            key={exp.id}
                            position={[xPos, deviceType === "billboard" ? 3.5 : 2, zPos]}
                            rotation={[0, -Math.PI / 2 + (zPos * 0.02), 0]} // Rotate slightly to face center
                            type={deviceType}
                            title={exp.company}
                        >
                            <div className="text-white h-full flex flex-col p-1">
                                <div className="flex justify-between items-start border-b border-zinc-700 pb-2 mb-2">
                                    <h3 className="text-lg font-bold text-primary-custom leading-tight">{exp.role}</h3>
                                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">
                                        {new Date(exp.start_date).getFullYear()} - {exp.current ? "Now" : new Date(exp.end_date as string).getFullYear()}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                    <p className="text-xs leading-relaxed text-zinc-300">
                                        {exp.description}
                                    </p>
                                </div>
                            </div>
                        </DeviceScreen>
                    );
                })}
            </group>

            {/* Projects Gallery - Back with TV Screens */}
            <group position={[0, 0, -20]}>
                <Text position={[0, 6, 0]} fontSize={1.2} color="white" anchorX="center">
                    Projects Gallery
                </Text>
                <Text position={[0, 5, 0]} fontSize={0.4} color="#71717a" anchorX="center">
                    Watch on the TV screens
                </Text>

                {/* TV Screens for Projects */}
                {projects.slice(0, 4).map((project, index) => {
                    const positions: [number, number, number][] = [
                        [-8, 2, 0],
                        [8, 2, 0],
                        [-8, 2, -8],
                        [8, 2, -8],
                    ];
                    const rotations: [number, number, number][] = [
                        [0, Math.PI / 6, 0],
                        [0, -Math.PI / 6, 0],
                        [0, Math.PI / 4, 0],
                        [0, -Math.PI / 4, 0],
                    ];

                    return (
                        <DeviceScreen
                            key={project.id}
                            position={positions[index]}
                            rotation={rotations[index]}
                            type="tv"
                            title={project.title}
                        >
                            <div className="text-white">
                                {project.image_url && (
                                    <img
                                        src={project.image_url}
                                        alt={project.title}
                                        className="w-full h-24 object-cover rounded mb-2"
                                    />
                                )}
                                <p className="text-xs text-zinc-400 line-clamp-3">{project.description}</p>
                                {project.link && (
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-xs transition-colors"
                                    >
                                        View Project →
                                    </a>
                                )}
                            </div>
                        </DeviceScreen>
                    );
                })}

                {/* TV Stands platform */}
                <mesh position={[0, 0, -4]} receiveShadow>
                    <boxGeometry args={[25, 0.2, 15]} />
                    <meshStandardMaterial color="#202024" />
                </mesh>
            </group>

            {/* Blog/Posts Section - Phone displays */}
            <group position={[0, 0, 10]}>
                <Text position={[0, 5, 0]} fontSize={1} color="white" anchorX="center">
                    Latest Blog Posts
                </Text>
                <Text position={[0, 4, 0]} fontSize={0.4} color="#71717a" anchorX="center">
                    Read on the 3D Phones
                </Text>

                {/* Phone pedestals */}
                {posts.slice(0, 4).map((post, index) => {
                    const angle = (index / 4) * Math.PI * 2;
                    const radius = 6;
                    const x = Math.sin(angle) * radius;
                    const z = Math.cos(angle) * radius;
                    const rotY = angle + Math.PI;

                    return (
                        <group key={post.id}>
                            {/* Pedestal */}
                            <mesh position={[x, 1, z]} castShadow>
                                <cylinderGeometry args={[0.8, 1, 2, 8]} />
                                <meshStandardMaterial color="#27272a" />
                            </mesh>

                            {/* Phone on pedestal */}
                            <DeviceScreen
                                position={[x, 3.5, z]}
                                rotation={[0, rotY, 0]}
                                type="phone"
                                title={post.title.slice(0, 20) + (post.title.length > 20 ? '...' : '')}
                            >
                                <div className="text-white text-xs">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-[10px]">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                        {post.published && (
                                            <span className="px-1.5 py-0.5 bg-green-900/50 text-green-400 rounded text-[10px]">
                                                Published
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-zinc-400 line-clamp-6 text-[11px] leading-relaxed">
                                        {post.content?.replace(/[#*_`]/g, '').slice(0, 200)}...
                                    </p>
                                    <button
                                        className="mt-3 w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-[10px] transition-colors"
                                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                                    >
                                        Read More
                                    </button>
                                </div>
                            </DeviceScreen>
                        </group>
                    );
                })}

                {/* Central platform */}
                <mesh position={[0, 0, 0]} receiveShadow>
                    <cylinderGeometry args={[10, 10, 0.1, 32]} />
                    <meshStandardMaterial color="#202024" />
                </mesh>
            </group>

            {/* Distance Skyline */}
            <Skyline count={30} />

            {/* Distant Mountain Ranges for Horizon */}
            <MountainRange count={20} radius={400} center={[0, 0, 0]} />
            <MountainRange count={15} radius={450} center={[50, 0, 50]} />
            <MountainRange count={15} radius={450} center={[-50, 0, -50]} />

            {/* Decorative elements */}
            <DecorativeElements />
        </group>
    );
}

// Road markings component
function RoadMarkings() {
    return (
        <group position={[0, 0.1, 0]}>
            {/* Main road - Elevated slightly */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[12, 140]} /> // Shortened to fit island
                <meshStandardMaterial color="#374151" />
            </mesh>
            {/* Side Curbs */}
            <mesh position={[-6.2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.4, 140]} />
                <meshStandardMaterial color="#e5e7eb" />
            </mesh>
            <mesh position={[6.2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.4, 140]} />
                <meshStandardMaterial color="#e5e7eb" />
            </mesh>

            {/* Center line */}
            {[...Array(18)].map((_, i) => (
                <mesh key={i} position={[0, 0.01, -66 + i * 8]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.5, 3]} />
                    <meshStandardMaterial color="#fcd34d" />
                </mesh>
            ))}
        </group>
    );
}

// Parked Car that player can enter
function ParkedCar({ position, rotation, onEnterCar }: { position: [number, number, number], rotation: [number, number, number], onEnterCar: () => void }) {
    const [isNear, setIsNear] = useState(false);
    const { camera } = useThree();

    useFrame(() => {
        const playerPos = camera.position;
        const carPos = new THREE.Vector3(...position);
        const distance = playerPos.distanceTo(carPos);

        if (distance < 6 && !isNear) setIsNear(true);
        if (distance >= 6 && isNear) setIsNear(false);
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'e' && isNear) {
                onEnterCar();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isNear, onEnterCar]);

    return (
        <group position={position} rotation={rotation}>
            {/* Omoda Prototypical Body */}
            <mesh castShadow>
                <boxGeometry args={[2.2, 0.8, 4.5]} />
                <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Cabin */}
            <mesh position={[0, 0.6, -0.4]}>
                <boxGeometry args={[1.8, 0.6, 2.8]} />
                <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.1} />
            </mesh>
            {/* Red Trim Accent */}
            <mesh position={[0, -0.4, 0]}>
                <boxGeometry args={[2.25, 0.1, 4.55]} />
                <meshStandardMaterial color="#dc2626" emissive="#7f1d1d" emissiveIntensity={0.2} />
            </mesh>

            {/* Interaction prompt */}
            {isNear && (
                <Html position={[0, 2.5, 0]} center distanceFactor={8}>
                    <div className="bg-black/80 text-white px-4 py-2 rounded-xl border border-white/20 shadow-xl backdrop-blur-md animate-bounce flex flex-col items-center">
                        <span className="text-xs text-zinc-400 mb-1 uppercase tracking-tighter">Chery Omoda</span>
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-0.5 bg-zinc-700 rounded text-sm font-bold border-b-2 border-zinc-900">E</kbd>
                            <span className="text-sm font-medium">To Drive</span>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

// Bazaar Area Component
function BazaarArea({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Main Shop Buildings - Now with collision */}
            <CollidableShop
                position={[position[0] + 0, position[1] + 2.5, position[2] + -20]}
                rotation={[0, Math.PI / 2, 0]}
                color="#4b5563"
                signColor="#fca5a5"
                signText="Shop"
            />
            <CollidableShop
                position={[position[0] + 0, position[1] + 2.5, position[2] + 20]}
                rotation={[0, Math.PI / 2, 0]}
                color="#374151"
                signColor="#93c5fd"
                signText="Shop"
            />

            {/* Market Stalls clusters - Now with collision */}
            <CollidableMarketStall
                position={[position[0] + 2, position[1] + 0, position[2] + -5]}
                rotation={[0, 0.2, 0]}
                roofColor="#ef4444"
            />
            <CollidableMarketStall
                position={[position[0] + 3, position[1] + 0, position[2] + 5]}
                rotation={[0, -0.3, 0]}
                roofColor="#3b82f6"
            />
            <CollidableMarketStall
                position={[position[0] + 1, position[1] + 0, position[2] + 12]}
                rotation={[0, 0.1, 0]}
                roofColor="#10b981"
            />
            <CollidableMarketStall
                position={[position[0] + 4, position[1] + 0, position[2] + -12]}
                rotation={[0, -0.4, 0]}
                roofColor="#f59e0b"
            />

            {/* Lanterns for atmosphere */}
            {[[-2, 4, -15], [-2, 4, -5], [-2, 4, 5], [-2, 4, 15], [5, 3, 0], [5, 3, 10], [5, 3, -10]].map(([x, y, z], i) => (
                <Lantern key={i} position={[x, y, z]} color={i % 2 === 0 ? "#fbbf24" : "#f59e0b"} />
            ))}

            {/* Crates and Barrels scattered */}
            <Crate position={[5, 0.4, -2]} rotation={[0, 0.5, 0]} />
            <Crate position={[5.2, 0.4, -2.8]} rotation={[0, -0.2, 0]} />
            <Crate position={[5, 1.2, -2.4]} rotation={[0, 0.1, 0]} />

            <Barrel position={[6, 0.5, 3]} />
            <Barrel position={[6.5, 0.5, 4]} rotation={[0, 0.3, 0]} />

            <Crate position={[4, 0.4, 8]} scale={0.8} />
            <Barrel position={[0, 0.5, 0]} scale={0.7} />

            {/* Strings of lanterns (imaginary strings) */}
            <Lantern position={[0, 4.5, -10]} color="#fbbf24" />
            <Lantern position={[0, 4.5, 0]} color="#fbbf24" />
            <Lantern position={[0, 4.5, 10]} color="#fbbf24" />
        </group>
    );
}

// Decorative elements - Optimized with Instancing
function DecorativeElements() {
    // Memoize static object positions to reduce object creation and HMR payload
    const palmPositions = useMemo(() => {
        const positions: { position: [number, number, number] }[] = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const x = -100 + i * 20;
                const z = -100 + j * 20;
                if (Math.abs(x) < 15 && Math.abs(z) < 25) continue;
                if (Math.abs(x) < 4) continue;
                positions.push({
                    position: [x + (Math.random() - 0.5) * 8, 0, z + (Math.random() - 0.5) * 8]
                });
            }
        }
        return positions;
    }, []);

    const buildingData = useMemo(() => {
        return [
            { position: [-50, 6, -60], scale: [1.2, 1.5, 1.2] },
            { position: [50, 6, -60], scale: [1.1, 1.8, 1.1] },
            { position: [-60, 6, 40], scale: [1.3, 1.2, 1.3] },
            { position: [60, 6, 40], scale: [1.4, 1.4, 1.4] },
            { position: [-15, 6, -40], scale: [0.8, 1.2, 0.8], color: "#1f2937" },
            { position: [15, 6, 20], scale: [0.7, 1.5, 0.7], color: "#111827" },
        ] as { position: [number, number, number], scale: [number, number, number], color?: string }[];
    }, []);

    return (
        <>
            {/* Grass clusters for floor depth */}
            {[...Array(20)].map((_, i) => (
                <GrassCluster key={i} position={[(Math.random() - 0.5) * 100, 0, (Math.random() - 0.5) * 100]} />
            ))}

            {/* Optimized High-rise Buildings - Visual only for distant buildings */}
            <BuildingInstances buildings={buildingData} />

            {/* Collidable Buildings - Main structures near player */}
            <CollidableBuilding position={[-50, 6, -60]} size={[8, 12, 8]} color="#4b5563" />
            <CollidableBuilding position={[50, 6, -60]} size={[7, 14, 7]} color="#4b5563" />
            <CollidableBuilding position={[-60, 6, 40]} size={[9, 11, 9]} color="#374151" />
            <CollidableBuilding position={[60, 6, 40]} size={[10, 13, 10]} color="#374151" />

            {/* Riverside Bazaar Area */}
            <BazaarArea position={[-25, 0, -10]} />

            {/* Light posts around the central plaza and road */}
            {[[-10, 0, -10], [10, 0, -10], [-10, 0, 10], [10, 0, 10], [-6, 0, -25], [6, 0, -25], [-6, 0, 25], [6, 0, 25]].map((pos, i) => (
                <LightPost key={i} position={pos as [number, number, number]} />
            ))}

            {/* Optimized Palm Oil Plantation */}
            <PalmTreeInstances trees={palmPositions} />

            {/* Floating geometric shapes */}
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 30;
                return (
                    <mesh
                        key={i}
                        position={[Math.sin(angle) * radius, 2 + Math.sin(i) * 0.5, Math.cos(angle) * radius]}
                        rotation={[Math.random(), Math.random(), Math.random()]}
                    >
                        <octahedronGeometry args={[0.5]} />
                        <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={0.2} />
                    </mesh>
                );
            })}
        </>
    );
}

// Helper function for skill colors
function getSkillColor(index: number): string {
    const colors = ["#4f46e5", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2"];
    return colors[index % colors.length];
}

interface ImageTextureProps {
    url: string;
    position: [number, number, number];
    scale: [number, number];
}

function ImageTexture({ url, position, scale }: ImageTextureProps) {
    return <DreiImage url={url} position={position} scale={scale} transparent />;
}
