/**
 * Lighting - Dynamic Environment Lighting
 * 
 * Purpose: Manage sun/sky lighting based on time of day
 * Features:
 * - Dynamic sun position and color
 * - Ambient lighting adjustment
 * - Soft shadows
 * - Sunset/day/night modes
 */

'use client';

import { useRef, useEffect, useMemo } from 'react';
import { DirectionalLight, AmbientLight, Color, HemisphereLight } from 'three';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '@/store/useGameStore';
import { Sky } from '@react-three/drei';

interface LightingProps {
  enableShadows?: boolean;
}

// Color presets for different times of day
const TIME_PRESETS = {
  day: {
    sunColor: 0xfffcd1,
    sunIntensity: 2,
    ambientColor: 0x404060,
    ambientIntensity: 0.5,
    skyColor: 0x87ceeb,
    groundColor: 0xe6d5b8,
    sunPosition: [10, 20, 10] as [number, number, number],
  },
  sunset: {
    sunColor: 0xffaa00,
    sunIntensity: 1.5,
    ambientColor: 0x604040,
    ambientIntensity: 0.4,
    skyColor: 0xff7700,
    groundColor: 0x8b7355,
    sunPosition: [50, 5, 10] as [number, number, number],
  },
  night: {
    sunColor: 0x6666ff,
    sunIntensity: 0.3,
    ambientColor: 0x101020,
    ambientIntensity: 0.2,
    skyColor: 0x0a0a20,
    groundColor: 0x1a1a2e,
    sunPosition: [-10, 30, -10] as [number, number, number],
  },
};

const Lighting: React.FC<LightingProps> = ({ 
  enableShadows = true 
}) => {
  const sunRef = useRef<DirectionalLight>(null);
  const ambientRef = useRef<AmbientLight>(null);
  const hemisphereRef = useRef<HemisphereLight>(null);
  const { scene } = useThree();

  // Subscribe to time of day from store
  const timeOfDay = useGameStore((state) => state.timeOfDay);

  // Get current preset
  const preset = TIME_PRESETS[timeOfDay];

  // Update lighting when time changes
  useEffect(() => {
    if (sunRef.current) {
      sunRef.current.color.setHex(preset.sunColor);
      sunRef.current.intensity = preset.sunIntensity;
      sunRef.current.position.set(...preset.sunPosition);
    }

    if (ambientRef.current) {
      ambientRef.current.color.setHex(preset.ambientColor);
      ambientRef.current.intensity = preset.ambientIntensity;
    }

    if (hemisphereRef.current) {
      hemisphereRef.current.color.setHex(preset.skyColor);
      hemisphereRef.current.groundColor.setHex(preset.groundColor);
    }

    // Update background color
    scene.background = new Color(preset.skyColor);

    console.log(`[Lighting] Time changed to: ${timeOfDay}`);
  }, [timeOfDay, preset, scene]);

  // Fog for depth
  useEffect(() => {
    scene.fog = null; // Disable fog for cleaner look, or enable with:
    // scene.fog = new Fog(preset.skyColor, 20, 100);
  }, [scene, preset.skyColor]);

  return (
    <>
      {/* Hemisphere light for ambient sky/ground gradient */}
      <hemisphereLight
        ref={hemisphereRef}
        color={preset.skyColor}
        groundColor={preset.groundColor}
        intensity={0.6}
      />

      {/* Ambient light for base illumination */}
      <ambientLight
        ref={ambientRef}
        color={preset.ambientColor}
        intensity={preset.ambientIntensity}
      />

      {/* Main sun light with shadows */}
      <directionalLight
        ref={sunRef}
        color={preset.sunColor}
        intensity={preset.sunIntensity}
        position={preset.sunPosition}
        castShadow={enableShadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0005}
      />

      {/* Optional: React Three Drei Sky for realistic atmosphere */}
      {timeOfDay === 'day' && (
        <Sky
          distance={450000}
          sunPosition={preset.sunPosition}
          inclination={0}
          azimuth={0.25}
        />
      )}
    </>
  );
};

export default Lighting;
