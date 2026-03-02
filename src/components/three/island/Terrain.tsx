'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { generateTerrain, TerrainConfig } from '@/lib/island/terrain';
import { getVoxelColor } from '@/lib/island/colors';

interface TerrainProps {
  config?: Partial<TerrainConfig>;
  seed?: number;
}

// Only terrain voxel types (not wood/leaves which are for trees)
type TerrainVoxelType = 'sand' | 'grass' | 'stone' | 'dirt' | 'water';

/**
 * Terrain component using InstancedMesh for performance
 * Renders thousands of voxel cubes efficiently
 */
export function Terrain({ config = {}, seed }: TerrainProps) {
  const terrainData = useMemo(() => {
    return generateTerrain(config);
  }, [config, seed]);

  // Group voxels by type for separate instanced meshes
  const voxelsByType = useMemo(() => {
    const grouped: Record<TerrainVoxelType, typeof terrainData.voxels> = {
      sand: [],
      grass: [],
      stone: [],
      dirt: [],
      water: [],
    };

    terrainData.voxels.forEach(voxel => {
      if (voxel.type in grouped) {
        grouped[voxel.type as TerrainVoxelType].push(voxel);
      }
    });

    return grouped;
  }, [terrainData]);

  return (
    <group>
      {(Object.keys(voxelsByType) as TerrainVoxelType[]).map(type => {
        const voxels = voxelsByType[type];
        if (voxels.length === 0) return null;

        return (
          <InstancedVoxels
            key={type}
            type={type}
            voxels={voxels}
          />
        );
      })}
    </group>
  );
}

interface InstancedVoxelsProps {
  type: TerrainVoxelType;
  voxels: { x: number; y: number; z: number; type: TerrainVoxelType }[];
}

/**
 * Render voxels of the same type using InstancedMesh
 */
function InstancedVoxels({ type, voxels }: InstancedVoxelsProps) {
  const mesh = useMemo(() => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // Water is transparent
    const isWater = type === 'water';
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Colors will be set per instance
      transparent: isWater,
      opacity: isWater ? 0.7 : 1,
      roughness: isWater ? 0.1 : 0.9,
      metalness: isWater ? 0.1 : 0,
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, voxels.length);
    instancedMesh.castShadow = !isWater;
    instancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    voxels.forEach((voxel, i) => {
      dummy.position.set(voxel.x, voxel.y, voxel.z);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);

      // Set color variation
      const voxelColor = getVoxelColor(type);
      color.setHex(voxelColor);

      // Add slight random variation
      if (type !== 'water') {
        const variation = (Math.random() - 0.5) * 0.05;
        color.r += variation;
        color.g += variation;
        color.b += variation;
      }

      instancedMesh.setColorAt(i, color);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }

    return instancedMesh;
  }, [type, voxels]);

  return <primitive object={mesh} />;
}
