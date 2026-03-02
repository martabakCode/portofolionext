'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { AvatarModel } from './AvatarModel';
import { Html, useProgress } from '@react-three/drei';

// R3F-compatible loader component
function LoaderScreen() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-center pointer-events-none">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-medium">Loading Avatar...</p>
        <p className="text-slate-400 text-sm">{Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

interface AvatarSceneProps {
  /** URL path to the GLB file */
  url?: string;
  /** Background color */
  backgroundColor?: string;
  /** Enable orbit controls */
  controls?: boolean;
  /** Camera position */
  cameraPosition?: [number, number, number];
  /** Show contact shadows */
  shadows?: boolean;
  /** Environment preset */
  environment?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby';
  /** Avatar scale */
  scale?: number;
  /** Auto-rotate avatar */
  autoRotate?: boolean;
  /** Enable floating animation */
  floatAnimation?: boolean;
  /** Class name for container */
  className?: string;
}

/**
 * AvatarScene - Complete 3D scene for displaying the avatar
 * 
 * Features:
 * - Ready-to-use scene with lighting and environment
 * - Contact shadows for grounded look
 * - Orbit controls for interaction
 * - Suspense loading state
 */
export function AvatarScene({
  url = '/avatar.glb',
  backgroundColor = 'transparent',
  controls = true,
  cameraPosition = [0, 1.5, 3],
  shadows = true,
  environment = 'city',
  scale = 1,
  autoRotate = false,
  floatAnimation = true,
  className = 'w-full h-full',
}: AvatarSceneProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: cameraPosition, fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        {/* Background */}
        {backgroundColor !== 'transparent' && (
          <color attach="background" args={[backgroundColor]} />
        )}

        {/* Lighting & Environment */}
        <Environment preset={environment} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={1024}
        />

        {/* Avatar with suspense */}
        <Suspense fallback={<LoaderScreen />}>
          <AvatarModel
            url={url}
            scale={scale}
            position={[0, 0, 0]}
            autoRotate={autoRotate}
            floatAnimation={floatAnimation}
          />
        </Suspense>

        {/* Contact shadows */}
        {shadows && (
          <ContactShadows
            position={[0, -1, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
          />
        )}

        {/* Controls */}
        {controls && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={8}
            target={[0, 0.5, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}
