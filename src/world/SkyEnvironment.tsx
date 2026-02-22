/**
 * SkyEnvironment - Atmospheric Effects
 * 
 * Features:
 * - Sky gradient
 * - Fog for depth
 * - Clouds
 * - Sun/Moon visual
 */

'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, SphereGeometry, MeshBasicMaterial, Color, Fog, FogExp2, Vector3, Group } from 'three';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';

interface SkyEnvironmentProps {
  size?: number;
}

const SkyEnvironment: React.FC<SkyEnvironmentProps> = ({ size = 500 }) => {
  const { scene } = useThree();
  const timeOfDay = useGameStore((state) => state.timeOfDay);

  // Sky colors based on time
  const skyColors = useMemo(() => {
    switch (timeOfDay) {
      case 'sunset':
        return {
          top: new Color(0x2d1b69),
          bottom: new Color(0xf97316),
          fog: new Color(0x7c2d12),
          sun: new Color(0xff6b35),
        };
      case 'night':
        return {
          top: new Color(0x0a0a20),
          bottom: new Color(0x1a1a3e),
          fog: new Color(0x0f0f23),
          sun: new Color(0x6666ff),
        };
      default: // day
        return {
          top: new Color(0x0ea5e9),
          bottom: new Color(0xbae6fd),
          fog: new Color(0xe0f2fe),
          sun: new Color(0xffffee),
        };
    }
  }, [timeOfDay]);

  // Update fog based on time
  useMemo(() => {
    scene.fog = new FogExp2(skyColors.fog, 0.008);
    scene.background = skyColors.top;
  }, [scene, skyColors]);

  return (
    <>
      {/* Sky dome */}
      <mesh scale={[-size, -size, -size]}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          vertexShader={`
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
          `}
          fragmentShader={`
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
              float h = normalize(vWorldPosition + offset).y;
              gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
          `}
          uniforms={{
            topColor: { value: skyColors.top },
            bottomColor: { value: skyColors.bottom },
            offset: { value: 33 },
            exponent: { value: 0.6 },
          }}
          side={1} // BackSide
        />
      </mesh>

      {/* Sun/Moon */}
      <CelestialBody color={skyColors.sun} timeOfDay={timeOfDay} />

      {/* Clouds */}
      <Clouds count={15} />
    </>
  );
};

interface CelestialBodyProps {
  color: Color;
  timeOfDay: 'day' | 'sunset' | 'night';
}

const CelestialBody: React.FC<CelestialBodyProps> = ({ color, timeOfDay }) => {
  const meshRef = useRef<Mesh>(null);

  const position = useMemo(() => {
    switch (timeOfDay) {
      case 'sunset':
        return [50, 10, 50];
      case 'night':
        return [-30, 60, -30];
      default:
        return [30, 80, 30];
    }
  }, [timeOfDay]);

  useFrame((state) => {
    if (meshRef.current && timeOfDay === 'day') {
      meshRef.current.position.y = 80 + Math.sin(state.clock.elapsedTime * 0.1) * 5;
    }
  });

  return (
    <mesh ref={meshRef} position={position as [number, number, number]}>
      <sphereGeometry args={timeOfDay === 'night' ? [3, 16, 16] : [8, 32, 32]} />
      <meshBasicMaterial
        color={color}
        fog={false}
      />
      {/* Glow effect */}
      <mesh scale={1.5}>
        <sphereGeometry args={[timeOfDay === 'night' ? 4 : 12, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          fog={false}
        />
      </mesh>
    </mesh>
  );
};

interface CloudsProps {
  count: number;
}

const Clouds: React.FC<CloudsProps> = ({ count }) => {
  const clouds = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: new Vector3(
        (Math.random() - 0.5) * 200,
        30 + Math.random() * 20,
        (Math.random() - 0.5) * 200
      ),
      scale: 5 + Math.random() * 10,
      speed: 0.5 + Math.random() * 1,
    }));
  }, [count]);

  return (
    <group>
      {clouds.map((cloud, index) => (
        <Cloud key={index} {...cloud} />
      ))}
    </group>
  );
};

interface CloudProps {
  position: Vector3;
  scale: number;
  speed: number;
}

const Cloud: React.FC<CloudProps> = ({ position, scale, speed }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x += speed * delta;
      if (groupRef.current.position.x > 100) {
        groupRef.current.position.x = -100;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Multiple spheres for cloud shape */}
      {[0, 0.3, -0.3, 0.2, -0.2].map((offset, i) => (
        <mesh key={i} position={[offset, Math.random() * 0.2, 0]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshBasicMaterial
            color={0xffffff}
            transparent
            opacity={0.6}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
};

export default SkyEnvironment;
