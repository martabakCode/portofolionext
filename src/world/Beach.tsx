/**
 * Beach - Sandy Beach Area
 * 
 * Features:
 * - Sand texture/appearance
 * - Beach slope leading to water
 * - Decorative elements
 */

'use client';

import { useRef, useMemo } from 'react';
import { Mesh, PlaneGeometry, MeshStandardMaterial, Vector3 } from 'three';
import { BeachAssets } from './BeachAssets';

interface BeachProps {
  size?: number;
  waterLevel?: number;
}

const Beach: React.FC<BeachProps> = ({ size = 200, waterLevel = 0 }) => {
  const meshRef = useRef<Mesh>(null);

  // Create beach geometry as a Ring
  const geometry = useMemo(() => {
    // Ring matching the terrain cliff to ocean transition
    const geo = new PlaneGeometry(size, size, 128, 128);
    const positions = geo.attributes.position.array as Float32Array;
    const vertexCount = positions.length / 3;

    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1]; // Z in world space (rotated)
      const dist = Math.sqrt(x * x + y * y);

      // Match Terrain Radius Logic
      const cliffRadius = size * 0.35; // ~70
      const maxRadius = size * 0.45; // ~90

      let z = -50.0; // Default hidden

      // Only show beach in the transition ring
      if (dist > cliffRadius - 5 && dist < maxRadius + 15) {
        // Slope down from cliff base
        // Terrain logic was: height -= (dist - cliffRadius) * 0.5;
        // Let's match it roughly but keep it sand-like

        // Base Terrain Height at this point:
        let terrainH = -(dist - cliffRadius) * 0.5;

        // Beach should be slightly above terrain to cover grass
        z = terrainH + 0.1;

        // Add dunes
        z += Math.sin(x * 0.2) * Math.cos(y * 0.3) * 0.6;

        // Flatten near water level (assuming water is ~ -3 to -5 relative to base 0)
        // If z < -2, flatten it out for shoreline
        if (z < -2) {
          z = Math.max(z, -3.5); // Floor it near water
        }
      }

      positions[i * 3 + 2] = z;
    }

    geo.computeVertexNormals();
    return geo;
  }, [size]);

  // Sand material
  const material = useMemo(() => {
    return new MeshStandardMaterial({
      color: 0xe6d5b8,      // Sand color
      roughness: 0.95,      // Very rough
      metalness: 0.0,
    });
  }, []);

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, waterLevel - 0.1, 0]} // Slightly below water
        receiveShadow
        name="beach"
      >
        <primitive object={material} attach="material" />
      </mesh>

      {/* Beach Assets (Rocks, Palms, Parasols) */}
      <group position={[0, waterLevel - 0.1, 0]}>
        <BeachAssets size={size} />
      </group>
    </group>
  );
};

export default Beach;
