'use client';

import { useMemo, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, PerspectiveCamera } from '@react-three/drei';
import { Terrain } from './Terrain';
import { Trees } from './Trees';
import { Water } from './Water';
import { Clouds } from './Clouds';
import { Lighting } from './Lighting';
import { ThirdPersonController } from '../avatar/ThirdPersonController';
import { generateTerrain, TerrainConfig } from '@/lib/island/terrain';

interface ThirdPersonIslandProps {
  seed?: number;
  config?: Partial<TerrainConfig>;
  timeOfDay?: 'day' | 'sunset' | 'night';
  showClouds?: boolean;
  treeCount?: number;
  playerSpeed?: number;
}

export function ThirdPersonIsland({
  seed = 12345,
  config = {},
  timeOfDay = 'day',
  showClouds = true,
  treeCount = 35,
  playerSpeed = 6,
}: ThirdPersonIslandProps) {
  const [regenerateKey, setRegenerateKey] = useState(0);

  const finalConfig = useMemo<Partial<TerrainConfig>>(() => ({
    width: 64,
    depth: 64,
    maxHeight: 12,
    waterLevel: 2.5,
    noiseScale: 0.05,
    islandRadius: 24,
    ...config,
  }), [config]);

  const terrainData = useMemo(() => {
    return generateTerrain(finalConfig);
  }, [finalConfig, seed, regenerateKey]);

  const regenerate = useCallback(() => {
    setRegenerateKey(k => k + 1);
  }, []);

  const centerX = (finalConfig.width || 64) / 2;
  const centerZ = (finalConfig.depth || 64) / 2;

  // Get terrain height at position
  const getTerrainHeight = useCallback((x: number, z: number) => {
    const width = finalConfig.width || 64;
    const depth = finalConfig.depth || 64;
    const maxHeight = terrainData.maxHeight || 12;
    
    const halfW = width / 2;
    const halfD = depth / 2;
    
    const gx = Math.floor(x + halfW);
    const gz = Math.floor(z + halfD);
    
    const cx = Math.max(0, Math.min(width - 1, gx));
    const cz = Math.max(0, Math.min(depth - 1, gz));
    
    const hv = terrainData.heightMap[cz]?.[cx] || 0;
    return (hv / 255) * maxHeight;
  }, [terrainData, finalConfig]);

  const bounds: [number, number, number, number] = [
    -centerX + 4, centerX - 4,
    -centerZ + 4, centerZ - 4
  ];

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Camera - initial position */}
        <PerspectiveCamera makeDefault position={[0, 10, 15]} fov={60} />

        {/* Sky */}
        {timeOfDay === 'night' ? (
          <>
            <color attach="background" args={['#0a0a1a']} />
            <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          </>
        ) : (
          <Sky
            distance={450000}
            sunPosition={timeOfDay === 'sunset' ? [100, 10, 100] : [100, 100, 50]}
            inclination={timeOfDay === 'sunset' ? 0.6 : 0.48}
            azimuth={0.25}
          />
        )}

        <Lighting timeOfDay={timeOfDay} />

        {/* World - centered */}
        <group position={[-centerX, 0, -centerZ]}>
          {/* Terrain */}
          <Terrain config={finalConfig} seed={seed + regenerateKey} />
          
          {/* Trees */}
          <Trees
            heightMap={terrainData.heightMap}
            waterLevel={finalConfig.waterLevel || 2.5}
            maxHeight={terrainData.maxHeight}
            count={treeCount}
          />
          
          {/* Water */}
          <Water
            width={finalConfig.width}
            depth={finalConfig.depth}
            waterLevel={finalConfig.waterLevel}
          />
          
          {/* Clouds */}
          {showClouds && (
            <Clouds
              count={6}
              area={finalConfig.width || 64}
              height={finalConfig.maxHeight || 12}
            />
          )}

          {/* Player - at center of island */}
          <group position={[centerX, 0, centerZ]}>
            <ThirdPersonController
              url="/avatar.glb"
              scale={0.7}
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
          args={[timeOfDay === 'night' ? 0x0a0a1a : 0x87ceeb, 40, 180]}
        />
      </Canvas>

      {/* UI */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur rounded-lg px-4 py-3 text-white pointer-events-none select-none">
        <h1 className="font-bold text-lg mb-1">🎮 3rd Person Island</h1>
        <div className="text-sm text-white/80 space-y-1">
          <p>
            <kbd className="bg-white/20 px-1.5 py-0.5 rounded font-mono">W</kbd>
            <kbd className="bg-white/20 px-1.5 py-0.5 rounded font-mono ml-1">A</kbd>
            <kbd className="bg-white/20 px-1.5 py-0.5 rounded font-mono ml-1">S</kbd>
            <kbd className="bg-white/20 px-1.5 py-0.5 rounded font-mono ml-1">D</kbd>
            <span className="ml-2">to move</span>
          </p>
          <p className="text-xs text-white/60">Camera follows from behind</p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <button
          onClick={regenerate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg"
        >
          🔄 New Island
        </button>
      </div>

      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur rounded-lg px-3 py-2 text-white text-sm pointer-events-none">
        Seed: {seed + regenerateKey}
      </div>
    </div>
  );
}
