'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LightingProps {
  timeOfDay?: 'day' | 'sunset' | 'night';
}

/**
 * Dynamic lighting setup for the island
 */
export function Lighting({ timeOfDay = 'day' }: LightingProps) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    // Subtle light animation
    if (sunRef.current) {
      sunRef.current.position.x = 30 + Math.sin(Date.now() * 0.0001) * 5;
    }
  });

  const config = getLightingConfig(timeOfDay);

  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight
        ref={ambientRef}
        color={config.ambient.color}
        intensity={config.ambient.intensity}
      />
      
      {/* Main directional light (sun/moon) */}
      <directionalLight
        ref={sunRef}
        color={config.sun.color}
        intensity={config.sun.intensity}
        position={config.sun.position as [number, number, number]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0005}
      />
      
      {/* Fill light from opposite side */}
      <directionalLight
        color={config.fill.color}
        intensity={config.fill.intensity}
        position={config.fill.position as [number, number, number]}
      />
      
      {/* Hemisphere light for sky/ground gradient */}
      <hemisphereLight
        color={config.hemisphere.sky}
        groundColor={config.hemisphere.ground}
        intensity={config.hemisphere.intensity}
      />
    </>
  );
}

function getLightingConfig(timeOfDay: 'day' | 'sunset' | 'night') {
  const configs = {
    day: {
      ambient: { color: 0x87ceeb, intensity: 0.4 },
      sun: { color: 0xfffaf0, intensity: 1.2, position: [30, 40, 20] as [number, number, number] },
      fill: { color: 0xadd8e6, intensity: 0.3, position: [-20, 20, -20] as [number, number, number] },
      hemisphere: { sky: 0x87ceeb, ground: 0x5a9a4b, intensity: 0.5 },
    },
    sunset: {
      ambient: { color: 0xffd4a3, intensity: 0.5 },
      sun: { color: 0xffa500, intensity: 1.0, position: [30, 15, 20] as [number, number, number] },
      fill: { color: 0x8b4513, intensity: 0.2, position: [-20, 10, -20] as [number, number, number] },
      hemisphere: { sky: 0xff6b6b, ground: 0x8b4513, intensity: 0.4 },
    },
    night: {
      ambient: { color: 0x191970, intensity: 0.2 },
      sun: { color: 0xf0f8ff, intensity: 0.4, position: [-30, 40, -20] as [number, number, number] },
      fill: { color: 0x483d8b, intensity: 0.15, position: [20, 10, 20] as [number, number, number] },
      hemisphere: { sky: 0x000033, ground: 0x1a1a2e, intensity: 0.3 },
    },
  };
  
  return configs[timeOfDay];
}
