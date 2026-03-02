'use client';

import { useMemo, useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { Terrain } from './Terrain';
import { Trees } from './Trees';
import { Water } from './Water';
import { Clouds } from './Clouds';
import { Lighting } from './Lighting';
import { CharacterController } from '../avatar/CharacterController';
import { generateTerrain, TerrainConfig, TerrainData } from '@/lib/island/terrain';

interface PlayableIslandSceneProps {
  seed?: number;
  config?: Partial<TerrainConfig>;
  timeOfDay?: 'day' | 'sunset' | 'night';
  showClouds?: boolean;
  treeCount?: number;
  playerSpeed?: number;
}

/**
 * Helper to get terrain height at world position
 */
function useTerrainHeight(terrainData: TerrainData, config: Partial<TerrainConfig>) {
  return useCallback((x: number, z: number) => {
    const width = config.width || 64;
    const depth = config.depth || 64;
    const maxHeight = terrainData.maxHeight || 14;
    
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    
    // Convert world coords to grid coords
    const gridX = Math.floor(x + halfWidth);
    const gridZ = Math.floor(z + halfDepth);
    
    // Clamp
    const clampedX = Math.max(0, Math.min(width - 1, gridX));
    const clampedZ = Math.max(0, Math.min(depth - 1, gridZ));
    
    // Get height
    const heightValue = terrainData.heightMap[clampedZ]?.[clampedX] || 0;
    
    // Convert to world height (0-255 to 0-maxHeight)
    return (heightValue / 255) * maxHeight;
  }, [terrainData, config]);
}

export function PlayableIslandScene({
  seed = Math.random(),
  config = {},
  timeOfDay = 'day',
  showClouds = true,
  treeCount = 40,
  playerSpeed = 5,
}: PlayableIslandSceneProps) {
  const [regenerateKey, setRegenerateKey] = useState(0);

  // Config with defaults
  const finalConfig = useMemo<Partial<TerrainConfig>>(() => ({
    width: 64,
    depth: 64,
    maxHeight: 14,
    waterLevel: 3,
    noiseScale: 0.045,
    islandRadius: 26,
    ...config,
  }), [config]);

  // Generate terrain
  const terrainData = useMemo(() => {
    return generateTerrain(finalConfig);
  }, [finalConfig, seed, regenerateKey]);

  const getTerrainHeight = useTerrainHeight(terrainData, finalConfig);

  const regenerate = useCallback(() => {
    setRegenerateKey(k => k + 1);
  }, []);

  const centerX = (finalConfig.width || 64) / 2;
  const centerZ = (finalConfig.depth || 64) / 2;
  
  const bounds: [number, number, number, number] = [
    -centerX + 3, 
    centerX - 3, 
    -centerZ + 3, 
    centerZ - 3
  ];

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          position={[centerX + 25, 20, centerZ + 25]}
          fov={50}
        />
        
        <OrbitControls
          target={[centerX, 5, centerZ]}
          enablePan={true}
          minDistance={10}
          maxDistance={60}
        />

        {/* Background */}
        {timeOfDay === 'night' ? (
          <>
            <color attach="background" args={['#0a0a1a']} />
            <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          </>
        ) : (
          <Sky
            distance={450000}
            sunPosition={timeOfDay === 'sunset' ? [30, 5, 20] : [30, 40, 20]}
            inclination={timeOfDay === 'sunset' ? 0.6 : 0.49}
            azimuth={0.25}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            rayleigh={timeOfDay === 'sunset' ? 4 : 2}
            turbidity={timeOfDay === 'sunset' ? 8 : 10}
          />
        )}

        {/* Lighting */}
        <Lighting timeOfDay={timeOfDay} />

        {/* Scene Objects */}
        <group position={[-centerX, 0, -centerZ]}>
          <Terrain config={finalConfig} seed={seed + regenerateKey} />
          
          <Trees
            heightMap={terrainData.heightMap}
            waterLevel={finalConfig.waterLevel || 3}
            maxHeight={terrainData.maxHeight}
            count={treeCount}
          />
          
          <Water
            width={finalConfig.width}
            depth={finalConfig.depth}
            waterLevel={finalConfig.waterLevel}
          />
          
          {showClouds && (
            <Clouds
              count={8}
              area={finalConfig.width || 64}
              height={finalConfig.maxHeight || 14}
            />
          )}

          {/* Character - placed at center of island */}
          <group position={[centerX, 0, centerZ]}>
            <CharacterController
              url="/avatar.glb"
              scale={1}
              speed={playerSpeed}
              bounds={bounds}
              startPosition={[0, 5, 0]}
              getTerrainHeight={getTerrainHeight}
            />
          </group>
        </group>

        {/* Fog */}
        <fog
          attach="fog"
          args={[
            timeOfDay === 'night' ? 0x0a0a1a : timeOfDay === 'sunset' ? 0xffd4a3 : 0x87ceeb,
            30,
            150,
          ]}
        />
      </Canvas>

      {/* UI */}
      <IslandUI onRegenerate={regenerate} seed={seed + regenerateKey} />
    </div>
  );
}

interface IslandUIProps {
  onRegenerate: () => void;
  seed: number;
}

function IslandUI({ onRegenerate, seed }: IslandUIProps) {
  return (
    <>
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3 text-white pointer-events-none z-10">
        <h2 className="font-bold text-lg mb-2">🏝️ Playable Island</h2>
        <div className="text-sm space-y-1 text-white/80">
          <p><kbd className="bg-white/20 px-1.5 py-0.5 rounded">W</kbd> <kbd className="bg-white/20 px-1.5 py-0.5 rounded">A</kbd> <kbd className="bg-white/20 px-1.5 py-0.5 rounded">S</kbd> <kbd className="bg-white/20 px-1.5 py-0.5 rounded">D</kbd> to move</p>
          <p className="text-xs">Drag to rotate camera • Scroll to zoom</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="pointer-events-auto bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
          <p className="font-medium">Seed: {seed.toFixed(4)}</p>
        </div>
        <button
          onClick={onRegenerate}
          className="pointer-events-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg"
        >
          New Island
        </button>
      </div>
    </>
  );
}
