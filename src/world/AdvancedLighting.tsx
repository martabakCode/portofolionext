/**
 * AdvancedLighting - Production-Ready Lighting Setup
 * 
 * Features:
 * - HDRI-based ambient lighting
 * - Dynamic sun with shadows
 * - Ambient occlusion simulation
 * - Time-based lighting changes
 * - Soft shadows
 */

'use client';

import { useRef, useEffect, useMemo } from 'react';
import { DirectionalLight, AmbientLight, HemisphereLight, Color, Vector3 } from 'three';
import { useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { useGameStore } from '@/store/useGameStore';

interface AdvancedLightingProps {
  enableShadows?: boolean;
}

// Lighting presets untuk setiap waktu
const LIGHTING_PRESETS = {
  day: {
    sunColor: 0xfffcd1,
    sunIntensity: 2.5,
    sunPosition: new Vector3(50, 100, 50),
    ambientColor: 0x87ceeb,
    ambientIntensity: 0.6,
    groundColor: 0xe6d5b8,
    skyColor: 0x87ceeb,
    fogColor: 0xe0f2fe,
    environment: 'sunset' as const,
  },
  sunset: {
    sunColor: 0xffaa33,
    sunIntensity: 1.8,
    sunPosition: new Vector3(100, 20, 0),
    ambientColor: 0xff7700,
    ambientIntensity: 0.5,
    groundColor: 0x8b7355,
    skyColor: 0xff5500,
    fogColor: 0xffccaa,
    environment: 'sunset' as const,
  },
  night: {
    sunColor: 0x6666ff,
    sunIntensity: 0.4,
    sunPosition: new Vector3(-50, 80, -50),
    ambientColor: 0x1a1a3e,
    ambientIntensity: 0.3,
    groundColor: 0x0a0a1a,
    skyColor: 0x0a0a20,
    fogColor: 0x1a1a3e,
    environment: 'night' as const,
  },
};

const AdvancedLighting: React.FC<AdvancedLightingProps> = ({ enableShadows = true }) => {
  const sunRef = useRef<DirectionalLight>(null);
  const ambientRef = useRef<AmbientLight>(null);
  const hemisphereRef = useRef<HemisphereLight>(null);
  const { scene } = useThree();

  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const preset = LIGHTING_PRESETS[timeOfDay];

  // Update lighting saat waktu berubah
  useEffect(() => {
    if (sunRef.current) {
      sunRef.current.color.setHex(preset.sunColor);
      sunRef.current.intensity = preset.sunIntensity;
      sunRef.current.position.copy(preset.sunPosition);
    }

    if (ambientRef.current) {
      ambientRef.current.color.setHex(preset.ambientColor);
      ambientRef.current.intensity = preset.ambientIntensity;
    }

    if (hemisphereRef.current) {
      hemisphereRef.current.color.setHex(preset.skyColor);
      hemisphereRef.current.groundColor.setHex(preset.groundColor);
    }

    // Update fog
    scene.background = new Color(preset.fogColor);
  }, [preset, scene]);

  return (
    <>
      {/* HDRI Environment */}
      <Environment
        preset={preset.environment}
        background={false}
        blur={0.5}
      />

      {/* Hemisphere light untuk sky/ground gradient */}
      <hemisphereLight
        ref={hemisphereRef}
        color={preset.skyColor}
        groundColor={preset.groundColor}
        intensity={0.8}
      />

      {/* Ambient light untuk base illumination */}
      <ambientLight
        ref={ambientRef}
        color={preset.ambientColor}
        intensity={preset.ambientIntensity}
      />

      {/* Main sun light dengan shadows */}
      <directionalLight
        ref={sunRef}
        color={preset.sunColor}
        intensity={preset.sunIntensity}
        position={preset.sunPosition}
        castShadow={enableShadows}
        shadow-mapSize={[4096, 4096]}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
        shadow-radius={4}
      />

      {/* Contact shadows untuk grounding */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={100}
        blur={2}
        far={10}
        resolution={512}
        color="#000000"
      />

      {/* Rim light untuk edge definition */}
      <directionalLight
        color={0x4455ff}
        intensity={0.3}
        position={[-50, 50, -50]}
      />
    </>
  );
};

export default AdvancedLighting;
