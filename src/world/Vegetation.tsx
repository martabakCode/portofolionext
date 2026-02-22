/**
 * Vegetation - Coastal Environment Props
 * 
 * Features:
 * - Grass patches
 * - Rocks/Boulders
 * - Small bushes
 * - Palm trees (low poly)
 */

'use client';

import { useRef, useMemo } from 'react';
import { Mesh, Vector3, BoxGeometry, ConeGeometry, SphereGeometry, CylinderGeometry } from 'three';
import { TerrainSystem } from '@/core/systems/TerrainSystem';

interface VegetationProps {
  count?: number;
  spread?: number;
}

const Vegetation: React.FC<VegetationProps> = ({ count = 50, spread = 80 }) => {
  // Generate random positions
  const elements = useMemo(() => {
    const items: Array<{
      type: 'rock' | 'grass' | 'bush' | 'palm';
      position: Vector3;
      scale: number;
      rotation: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Random radius within the spread (island radius)
      // Avoid center (0-10) where office is
      const radius = 15 + Math.random() * (spread * 0.45);

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Get height from TerrainSystem
      let y = TerrainSystem.getHeightAt(x, z);

      // If underwater, skip or adjust
      if (y < -1.5) continue;

      const typeRandom = Math.random();
      let type: 'rock' | 'grass' | 'bush' | 'palm'; // Simplified for now

      if (y < 0.5) {
        // Beach area
        type = typeRandom < 0.5 ? 'rock' : 'palm';
      } else {
        // Inland
        if (typeRandom < 0.3) type = 'rock';
        else if (typeRandom < 0.6) type = 'bush';
        else type = 'grass'; // Or Tree
      }

      items.push({
        type: type as any,
        position: new Vector3(x, y, z),
        scale: 0.5 + Math.random() * 0.8,
        rotation: Math.random() * Math.PI * 2,
      });
    }

    return items;
  }, [count, spread]);

  return (
    <group name="vegetation">
      {elements.map((item, index) => (
        <VegetationElement key={index} {...item} />
      ))}
    </group>
  );
};

interface VegetationElementProps {
  type: 'rock' | 'grass' | 'bush' | 'palm';
  position: Vector3;
  scale: number;
  rotation: number;
}

const VegetationElement: React.FC<VegetationElementProps> = ({
  type,
  position,
  scale,
  rotation,
}) => {
  const meshRef = useRef<Mesh>(null);

  switch (type) {
    case 'rock':
      return (
        <mesh
          ref={meshRef}
          position={position}
          rotation={[Math.random() * 0.3, rotation, Math.random() * 0.3]}
          scale={[scale, scale * 0.6, scale]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={0x808080} roughness={0.9} />
        </mesh>
      );

    case 'grass':
      return (
        <mesh
          ref={meshRef}
          position={position}
          rotation={[0, rotation, 0]}
          scale={scale}
        >
          <coneGeometry args={[0.1, 0.5, 4]} />
          <meshStandardMaterial color={0x4ade80} roughness={0.8} />
        </mesh>
      );

    case 'bush':
      return (
        <mesh
          ref={meshRef}
          position={position}
          scale={scale}
          castShadow
        >
          <sphereGeometry args={[0.5, 8, 6]} />
          <meshStandardMaterial color={0x22c55e} roughness={0.9} />
        </mesh>
      );

    case 'palm':
      return (
        <group position={position} rotation={[0, rotation, 0]} scale={scale}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 3, 6]} />
            <meshStandardMaterial color={0x8b4513} roughness={0.8} />
          </mesh>
          {/* Leaves */}
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[0, 3, 0]}
              rotation={[(Math.PI / 4), 0, (i * Math.PI * 2) / 5]}
            >
              <coneGeometry args={[0.3, 1.5, 3]} />
              <meshStandardMaterial color={0x16a34a} roughness={0.8} />
            </mesh>
          ))}
        </group>
      );

    default:
      return null;
  }
};

export default Vegetation;
