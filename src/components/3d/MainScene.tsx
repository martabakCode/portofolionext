"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { KeyboardControls, Stars, Sky, Cloud, OrbitControls } from "@react-three/drei";
import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { Vector3, PerspectiveCamera } from "three";
import PlayerRapier from "./PlayerRapier";
import World from "./World";
import CarRapier from "./CarRapier";
import { PhysicsProvider } from "@/physics/PhysicsProvider";
import type { Post } from "@/modules/posts/posts.types";
import type { Project } from "@/modules/projects/projects.types";
import type { Profile } from "@/modules/profile/profile.types";
import type { Experience } from "@/modules/experience/experience.types";
import type { TechStack } from "@/modules/techstack/techstack.types";

interface MainSceneProps {
    posts: Post[];
    projects: Project[];
    profile: Profile | null;
    experiences: Experience[];
    techStacks: TechStack[];
}

// Cinematic Camera Controller
function CinematicCamera({ gameState }: { gameState: string }) {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);
    const scrollProgress = useRef(0);

    // Initial cinematic position
    const initialPosition = useRef(new Vector3(0, 35, 85));
    const targetPosition = useRef(new Vector3(0, 0, 0));

    // Smooth intro animation
    useEffect(() => {
        if (gameState !== 'menu') return;
        
        const startPos = new Vector3(
            initialPosition.current.x * 1.3,
            initialPosition.current.y * 1.2,
            initialPosition.current.z * 1.3
        );
        
        camera.position.copy(startPos);
        camera.lookAt(targetPosition.current);
        
        // Animate to final position
        let progress = 0;
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            
            camera.position.lerpVectors(startPos, initialPosition.current, ease);
            camera.lookAt(targetPosition.current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }, [camera, gameState]);

    // Handle scroll-based camera movement
    useEffect(() => {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    scrollProgress.current = Math.min(window.scrollY / (docHeight || 1), 1);
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Only show OrbitControls in menu/paused state
    if (gameState !== 'menu' && gameState !== 'paused') return null;

    return (
        <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.04}
            minDistance={25}
            maxDistance={150}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.2}
            target={targetPosition.current}
            enablePan={false}
            enableZoom={true}
            autoRotate={false}
        />
    );
}

// Pointer Lock Manager Component
function SceneControls({ gameState, onLock, onUnlock }: {
    gameState: string;
    onLock: () => void;
    onUnlock: () => void;
}) {
    const { gl } = useThree();
    if (gameState !== 'playing') return null;

    return null; // Pointer lock disabled for cinematic mode
}

export default function MainScene({ posts, projects, profile, experiences, techStacks }: MainSceneProps) {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'driving' | 'paused'>('menu');
    const [isLoaded, setIsLoaded] = useState(false);

    const map = [
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
        { name: "sprint", keys: ["Shift"] },
        { name: "brake", keys: [" "] },
    ];

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleEnterCar = useCallback(() => {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        setGameState('driving');
    }, []);

    const handleExitCar = useCallback(() => {
        setGameState('paused');
    }, []);

    const handleLock = useCallback(() => {
        setGameState('playing');
    }, []);

    const handleUnlock = useCallback(() => {
        setGameState(prev => prev === 'driving' ? 'driving' : 'paused');
    }, []);

    const startGame = useCallback(() => {
        setGameState('playing');
    }, []);

    if (!isLoaded) {
        return (
            <div className="w-full h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-white text-xl">Loading 3D World...</div>
            </div>
        );
    }

    const showOverlay = gameState === 'menu' || gameState === 'paused';
    const isDriving = gameState === 'driving';
    const isPlaying = gameState === 'playing' || gameState === 'driving';

    return (
        <div className="w-full h-screen bg-zinc-950 relative overflow-hidden">
            <KeyboardControls map={map}>
                <Canvas
                    shadows
                    camera={{ 
                        fov: 50, 
                        position: [0, 35, 85],
                        near: 0.1,
                        far: 1000,
                    }}
                    gl={{
                        antialias: true,
                        alpha: false,
                        powerPreference: 'high-performance',
                    }}
                    dpr={[1, 2]}
                >
                    <SceneControls
                        gameState={gameState}
                        onLock={handleLock}
                        onUnlock={handleUnlock}
                    />

                    {/* Cinematic Camera */}
                    <CinematicCamera gameState={gameState} />

                    <Suspense fallback={null}>
                        <PhysicsProvider debug={false}>
                            <color attach="background" args={['#bae6fd']} />
                            <fog attach="fog" args={['#bae6fd', 30, 180]} />

                            {/* Sky */}
                            <Sky
                                distance={450000}
                                sunPosition={[10, 20, 10]}
                                inclination={0}
                                azimuth={0.25}
                                mieCoefficient={0.005}
                                mieDirectionalG={0.07}
                                rayleigh={0.5}
                            />

                            {/* Lighting - Bright Coastal Day */}
                            <ambientLight intensity={0.6} color="#ffffff" />
                            <hemisphereLight
                                color="#87ceeb"
                                groundColor="#e8f5e9"
                                intensity={0.5}
                                position={[0, 50, 0]}
                            />
                            <directionalLight
                                position={[10, 15, -10]}
                                intensity={1.5}
                                color="#fff8e7"
                                castShadow
                                shadow-mapSize={[2048, 2048]}
                                shadow-camera-far={200}
                                shadow-camera-left={-100}
                                shadow-camera-right={100}
                                shadow-camera-top={100}
                                shadow-camera-bottom={-100}
                                shadow-bias={-0.0005}
                                shadow-radius={4}
                            />
                            {/* Fill light */}
                            <directionalLight
                                position={[-5, 20, 15]}
                                intensity={0.3}
                                color="#87ceeb"
                            />

                            {/* Player - only render when playing (not driving) */}
                            {!isDriving && (
                                <PlayerRapier
                                    locked={gameState === 'playing'}
                                    isDriving={isDriving}
                                />
                            )}

                            {/* Driveable Car */}
                            <CarRapier
                                isDriving={isDriving}
                                onExitCar={handleExitCar}
                            />

                            {/* 3D World */}
                            <World
                                posts={posts}
                                projects={projects}
                                profile={profile}
                                experiences={experiences}
                                isDriving={isDriving}
                                onEnterCar={handleEnterCar}
                                techStacks={techStacks}
                            />

                            {/* Stars - only visible at night */}
                            <Stars radius={150} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
                            
                            {/* Clouds */}
                            <CloudsGroup count={6} />
                        </PhysicsProvider>
                    </Suspense>
                </Canvas>
            </KeyboardControls>

            {/* Overlay - Only show when menu or paused */}
            {showOverlay && (
                <div
                    className="absolute inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                    <div
                        className="text-center text-white p-8 bg-zinc-900/90 border border-zinc-700 rounded-2xl shadow-2xl max-w-md mx-4 backdrop-blur-md"
                    >
                        <div className="mb-6">
                            <span className="text-5xl">🏔️</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Coastal World Explorer</h1>
                        <p className="text-zinc-400 mb-6">
                            Explore a procedurally generated coastal landscape with immersive 3D terrain
                        </p>

                        <div className="space-y-3 mb-6 text-left bg-zinc-800/50 p-4 rounded-xl">
                            <div className="flex items-center gap-3 text-sm">
                                <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs font-mono">🖱️</kbd>
                                <span className="text-zinc-300">Drag to rotate view</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs font-mono">📜</kbd>
                                <span className="text-zinc-300">Scroll to move camera</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs font-mono">WASD</kbd>
                                <span className="text-zinc-300">Move around (in game)</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs font-mono">🚗</kbd>
                                <span className="text-zinc-300">Click car to drive</span>
                            </div>
                        </div>

                        <button
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors w-full cursor-pointer"
                            onClick={startGame}
                        >
                            {gameState === 'menu' ? "Enter Coastal World" : "Resume Game"}
                        </button>
                    </div>
                </div>
            )}

            {/* HUD when playing */}
            {isPlaying && (
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none select-none z-40">
                    <div className="text-white/60 text-sm space-y-1 bg-black/40 backdrop-blur px-4 py-3 rounded-xl">
                        {isDriving ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-xs">W/S</kbd>
                                    <span>Accelerate/Reverse</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-xs">A/D</kbd>
                                    <span>Steer</span>
                                </div>
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-xs">E</kbd>
                                    <span>Exit Car</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-xs">WASD</kbd>
                                    <span>Move</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-xs">SHIFT</kbd>
                                    <span>Sprint</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-xs">ESC</kbd>
                                    <span>Pause</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={`px-4 py-2 rounded-xl font-bold text-sm ${isDriving
                        ? 'bg-indigo-600/80 text-white'
                        : 'bg-zinc-800/80 text-zinc-300'
                        }`}>
                        {isDriving ? '🚗 Driving Mode' : '🚶 Walking Mode'}
                    </div>
                </div>
            )}

            {/* Exit driving hint */}
            {isDriving && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white px-6 py-3 rounded-full animate-pulse pointer-events-none">
                    Press <kbd className="mx-1 px-2 py-0.5 bg-zinc-700 rounded text-sm">E</kbd> to exit car
                </div>
            )}
        </div>
    );
}

// Clouds Group Component
function CloudsGroup({ count = 6 }: { count?: number }) {
    const positions = [
        [30, 25, -20],
        [-40, 30, 10],
        [20, 28, 40],
        [-25, 32, -30],
        [50, 26, 20],
        [-35, 29, -10],
    ];

    return (
        <>
            {positions.slice(0, count).map((pos, i) => (
                <Cloud
                    key={i}
                    position={pos as [number, number, number]}
                    speed={0.1 + Math.random() * 0.1}
                    opacity={0.6}
                    scale={[2 + Math.random() * 2, 1, 1.5 + Math.random()]}
                />
            ))}
        </>
    );
}
