'use client';

import { useMemo, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { Terrain } from './Terrain';
import { Trees } from './Trees';
import { Water } from './Water';
import { Clouds } from './Clouds';
import { Lighting } from './Lighting';
import { CameraController } from './CameraController';
import { generateTerrain, TerrainConfig } from '@/lib/island/terrain';

interface IslandSceneProps {
  seed?: number;
  config?: Partial<TerrainConfig>;
  timeOfDay?: 'day' | 'sunset' | 'night';
  showClouds?: boolean;
  treeCount?: number;
}

/**
 * Main Island Scene component
 * Combines all island elements into a complete scene
 */
export function IslandScene({
  seed = Math.random(),
  config = {},
  timeOfDay = 'day',
  showClouds = true,
  treeCount = 40,
}: IslandSceneProps) {
  const [regenerateKey, setRegenerateKey] = useState(0);

  // Merge config with defaults
  const finalConfig = useMemo<Partial<TerrainConfig>>(() => ({
    width: 64,
    depth: 64,
    maxHeight: 14,
    waterLevel: 3,
    noiseScale: 0.045,
    islandRadius: 26,
    ...config,
  }), [config]);

  // Generate terrain data for tree placement
  const terrainData = useMemo(() => {
    return generateTerrain(finalConfig);
  }, [finalConfig, seed, regenerateKey]);

  // Regenerate island callback
  const regenerate = useCallback(() => {
    setRegenerateKey(k => k + 1);
  }, []);

  // Calculate center for camera target
  const centerX = (finalConfig.width || 64) / 2;
  const centerZ = (finalConfig.depth || 64) / 2;

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [60, 40, 60], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
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

        {/* Camera Controls */}
        <CameraController
          target={[centerX, 5, centerZ]}
          initialPosition={[centerX + 30, 30, centerZ + 30]}
        />

        {/* Scene Objects */}
        <group position={[-centerX, 0, -centerZ]}>
          {/* Terrain */}
          <Terrain config={finalConfig} seed={seed + regenerateKey} />

          {/* Trees */}
          <Trees
            heightMap={terrainData.heightMap}
            waterLevel={finalConfig.waterLevel || 3}
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
              count={8}
              area={finalConfig.width || 64}
              height={finalConfig.maxHeight || 14}
            />
          )}
        </group>

        {/* Fog for depth */}
        <fog
          attach="fog"
          args={[
            timeOfDay === 'night' ? 0x0a0a1a : timeOfDay === 'sunset' ? 0xffd4a3 : 0x87ceeb,
            30,
            120,
          ]}
        />
      </Canvas>

      {/* UI Overlay */}
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
    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
      <div className="pointer-events-auto bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
        <p className="font-medium">Island Seed: {seed.toFixed(6)}</p>
        <p className="text-xs text-white/70">
          Left click: Rotate • Right click: Pan • Scroll: Zoom
        </p>
      </div>

      <button
        onClick={onRegenerate}
        className="pointer-events-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg"
      >
        Generate New Island
      </button>
    </div>
  );
}
