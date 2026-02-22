'use client';

import { useRef, useMemo } from 'react';
import { Mesh, DoubleSide } from 'three';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TERRAIN_CONFIG } from '@/core/systems/TerrainSystem';

const waterVertexShader = `
  uniform float uTime;
  uniform float uWaveHeight;
  uniform float uWaveSpeed;
  uniform float uWaveFrequency;
  
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    // Calculate wave displacement
    float wave1 = sin(position.x * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight;
    float wave2 = sin(position.z * uWaveFrequency * 0.8 + uTime * uWaveSpeed * 1.2) * uWaveHeight * 0.5;
    float wave3 = sin((position.x + position.z) * uWaveFrequency * 0.5 + uTime * uWaveSpeed * 0.8) * uWaveHeight * 0.3;
    
    float totalWave = wave1 + wave2 + wave3;
    
    vec3 newPosition = position;
    newPosition.y += totalWave;
    
    vElevation = totalWave;
    
    // Approximate normal from waves
    float dx = cos(position.x * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight * uWaveFrequency;
    float dz = cos(position.z * uWaveFrequency * 0.8 + uTime * uWaveSpeed * 1.2) * uWaveHeight * 0.5 * uWaveFrequency * 0.8;
    
    vec3 newNormal = normalize(normal + vec3(-dx, 1.0, -dz));
    vNormal = normalize(normalMatrix * newNormal);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const waterFragmentShader = `
  uniform vec3 uColorDeep;
  uniform vec3 uColorShallow;
  uniform float uOpacity;
  
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Base water color with depth variation
    vec3 waterColor = mix(uColorDeep, uColorShallow, vElevation * 2.0 + 0.5);
    
    // Add specular highlights
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    vec3 halfDir = normalize(lightDir + viewDir);
    
    float specAngle = max(dot(vNormal, halfDir), 0.0);
    float specular = pow(specAngle, 32.0) * 0.5;
    
    // Fresnel effect
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.0);
    
    // Foam at wave peaks
    float foam = smoothstep(0.6, 1.0, vElevation * 2.0 + 0.5);
    
    vec3 finalColor = waterColor + vec3(specular) + vec3(foam * 0.3);
    finalColor = mix(finalColor, uColorShallow, fresnel * 0.3);
    
    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

export default function Ocean() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { waterLevel } = TERRAIN_CONFIG;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uWaveHeight: { value: 0.3 },
    uWaveSpeed: { value: 1.0 },
    uWaveFrequency: { value: 0.25 },
    uColorDeep: { value: new THREE.Vector3(0.05, 0.15, 0.35) },
    uColorShallow: { value: new THREE.Vector3(0.20, 0.55, 0.75) },
    uOpacity: { value: 0.85 },
  }), []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, waterLevel, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[300, 300, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={waterVertexShader}
        fragmentShader={waterFragmentShader}
        uniforms={uniforms}
        transparent
        side={DoubleSide}
      />
    </mesh>
  );
}
