'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WaterProps {
  width?: number;
  depth?: number;
  waterLevel?: number;
}

/**
 * Animated water plane with shader effects
 */
export function Water({ width = 64, depth = 64, waterLevel = 2 }: WaterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x249fde) },
    uColorDeep: { value: new THREE.Color(0x1a6f9a) },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[width / 2 - 0.5, waterLevel - 0.4, depth / 2 - 0.5]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[width + 10, depth + 10, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={waterVertexShader}
        fragmentShader={waterFragmentShader}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

const waterVertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    // Wave calculations
    float wave1 = sin(pos.x * 0.3 + uTime * 0.8) * 0.15;
    float wave2 = sin(pos.y * 0.2 + uTime * 0.6) * 0.15;
    float wave3 = sin((pos.x + pos.y) * 0.1 + uTime * 0.4) * 0.1;
    
    float elevation = wave1 + wave2 + wave3;
    pos.z += elevation;
    vElevation = elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const waterFragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uColorDeep;
  uniform float uTime;
  
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Mix colors based on elevation
    float mixStrength = (vElevation + 0.3) * 1.5;
    vec3 color = mix(uColorDeep, uColor, mixStrength);
    
    // Add foam/sparkle effect
    float sparkle = sin(vUv.x * 50.0 + uTime * 2.0) * sin(vUv.y * 50.0 + uTime * 1.5);
    sparkle = smoothstep(0.8, 1.0, sparkle) * 0.3;
    color += sparkle;
    
    // Opacity based on viewing angle (fake depth)
    float alpha = 0.7 + vElevation * 0.2;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
