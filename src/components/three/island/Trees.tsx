'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface TreeData {
  x: number;
  y: number;
  z: number;
  height: number;
  leafRadius: number;
  type: 'oak' | 'pine' | 'birch';
}

interface TreesProps {
  heightMap: number[][];
  waterLevel: number;
  maxHeight: number;
  count?: number;
}

// Natural green colors for different tree types
const TREE_COLORS = {
  oak: [0x2d5016, 0x3d6b1f, 0x4a7c28, 0x366314],
  pine: [0x1a4010, 0x255018, 0x1e4512, 0x2a5a1c],
  birch: [0x4a6741, 0x5a7a4f, 0x6b8c5e, 0x5c7d52],
};

const TRUNK_COLORS = {
  oak: 0x5c4033,
  pine: 0x3d2817,
  birch: 0x8b7355,
};

/**
 * Find valid tree positions using heightMap directly
 */
function findValidTreePositions(
  heightMap: number[][],
  waterLevel: number,
  maxHeight: number,
  count: number
): { x: number; z: number }[] {
  const positions: { x: number; z: number }[] = [];
  const width = heightMap.length;
  const depth = heightMap[0]?.length || 0;
  
  const attempts = count * 15;
  let placed = 0;
  
  for (let i = 0; i < attempts && placed < count; i++) {
    // Avoid edges
    const x = Math.floor(Math.random() * (width - 6)) + 3;
    const z = Math.floor(Math.random() * (depth - 6)) + 3;
    const height = heightMap[x]?.[z] || 0;
    
    // Only place trees on grass/plains (not beach, not mountain)
    const isBeach = height <= waterLevel + 1;
    const isMountain = height >= maxHeight * 0.7;
    const isWater = height <= waterLevel;
    
    if (!isBeach && !isMountain && !isWater && height > 0) {
      // Check if position is clear (no nearby trees)
      const tooClose = positions.some(pos => {
        const dx = pos.x - x;
        const dz = pos.z - z;
        return Math.sqrt(dx * dx + dz * dz) < 4;
      });
      
      if (!tooClose) {
        positions.push({ x, z });
        placed++;
      }
    }
  }
  
  return positions;
}

/**
 * Procedural trees with natural variation and gentle wind animation
 * Fixed: Proper Y positioning using heightMap lookup
 */
export function Trees({ heightMap, waterLevel, maxHeight, count = 40 }: TreesProps) {
  const treeData = useMemo<TreeData[]>(() => {
    const positions = findValidTreePositions(heightMap, waterLevel, maxHeight, count);
    
    return positions.map(pos => {
      const rand = Math.random();
      let type: TreeData['type'] = 'oak';
      if (rand > 0.6) type = 'pine';
      else if (rand > 0.85) type = 'birch';
      
      // Get actual terrain height at this position
      const terrainHeight = heightMap[pos.x]?.[pos.z] || 0;
      
      return {
        x: pos.x,
        z: pos.z,
        y: terrainHeight + 1, // Place on top of terrain
        height: type === 'pine' ? 4 + Math.random() * 3 : 2 + Math.random() * 2.5,
        leafRadius: type === 'pine' ? 1.2 + Math.random() * 0.8 : 1.8 + Math.random() * 1.2,
        type,
      };
    });
  }, [heightMap, waterLevel, maxHeight, count]);

  // Separate trunks and leaves for different materials
  const { trunkInstances, leafInstances } = useMemo(() => {
    const trunks: { x: number; y: number; z: number; type: TreeData['type'] }[] = [];
    const leaves: { x: number; y: number; z: number; scale: number; type: TreeData['type']; treeIndex: number }[] = [];
    
    treeData.forEach((tree, treeIndex) => {
      // Trunk voxels - grow upward from terrain surface
      const trunkHeight = Math.max(2, Math.floor(tree.height * 0.6));
      for (let i = 0; i < trunkHeight; i++) {
        trunks.push({
          x: tree.x,
          y: tree.y + i, // Start at terrain surface + 1
          z: tree.z,
          type: tree.type,
        });
      }
      
      // Leaf clusters based on tree type
      const leafStartY = tree.y + trunkHeight - 0.5;
      
      if (tree.type === 'pine') {
        // Pine trees - cone shaped, pointing upward
        const layers = Math.ceil(tree.leafRadius * 2.5);
        for (let layer = 0; layer < layers; layer++) {
          const layerY = leafStartY + layer * 0.9;
          const layerRadius = tree.leafRadius * (1 - layer / layers) * 1.2;
          
          if (layerRadius < 0.3) continue;
          
          const pointsInLayer = Math.max(4, Math.ceil(Math.PI * 2 * layerRadius * 1.5));
          
          for (let i = 0; i < pointsInLayer; i++) {
            const angle = (i / pointsInLayer) * Math.PI * 2 + (layer * 0.5);
            const r = layerRadius * (0.6 + Math.random() * 0.4);
            leaves.push({
              x: tree.x + Math.cos(angle) * r,
              y: layerY,
              z: tree.z + Math.sin(angle) * r,
              scale: 0.8 + Math.random() * 0.3,
              type: tree.type,
              treeIndex,
            });
          }
        }
      } else {
        // Oak and birch - round/irregular cloud shape
        const leafCenterY = leafStartY + tree.leafRadius * 0.5;
        const leafCount = Math.floor(Math.PI * 3 * tree.leafRadius * tree.leafRadius);
        
        for (let i = 0; i < leafCount; i++) {
          // Spherical distribution with noise
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = tree.leafRadius * Math.pow(Math.random(), 1/3);
          
          leaves.push({
            x: tree.x + r * Math.sin(phi) * Math.cos(theta),
            y: leafCenterY + r * Math.cos(phi) * 0.6, // Flattened sphere
            z: tree.z + r * Math.sin(phi) * Math.sin(theta),
            scale: 0.7 + Math.random() * 0.4,
            type: tree.type,
            treeIndex,
          });
        }
      }
    });
    
    return { trunkInstances: trunks, leafInstances: leaves };
  }, [treeData]);

  return (
    <group>
      <InstancedTrunks instances={trunkInstances} />
      <InstancedLeaves instances={leafInstances} />
    </group>
  );
}

interface TrunkInstance {
  x: number;
  y: number;
  z: number;
  type: TreeData['type'];
}

function InstancedTrunks({ instances }: { instances: TrunkInstance[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const mesh = useMemo(() => {
    if (instances.length === 0) return null;
    
    const geometry = new THREE.BoxGeometry(0.7, 1, 0.7);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.95,
      metalness: 0.0,
    });
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, instances.length);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    
    const dummy = new THREE.Object3D();
    const colors = new Float32Array(instances.length * 3);
    const color = new THREE.Color();
    
    instances.forEach((instance, i) => {
      // Center the trunk voxel
      dummy.position.set(instance.x, instance.y + 0.5, instance.z);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
      
      // Color variation per trunk
      color.setHex(TRUNK_COLORS[instance.type]);
      const variation = (Math.random() - 0.5) * 0.08;
      color.r += variation;
      color.g += variation;
      color.b += variation;
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    
    return instancedMesh;
  }, [instances]);

  if (!mesh) return null;
  return <primitive object={mesh} ref={meshRef} />;
}

interface LeafInstance {
  x: number;
  y: number;
  z: number;
  scale: number;
  type: TreeData['type'];
  treeIndex: number;
}

function InstancedLeaves({ instances }: { instances: LeafInstance[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const initialPositions = useRef<Float32Array | null>(null);
  const treeOffsets = useRef<number[]>([]);
  
  // Store initial positions and generate random offsets per tree
  useMemo(() => {
    if (instances.length === 0) return;
    
    if (!initialPositions.current || initialPositions.current.length !== instances.length * 3) {
      initialPositions.current = new Float32Array(instances.length * 3);
      const uniqueTrees = new Set(instances.map(i => i.treeIndex));
      treeOffsets.current = Array.from(uniqueTrees).map(() => Math.random() * Math.PI * 2);
    }
    
    instances.forEach((instance, i) => {
      initialPositions.current![i * 3] = instance.x;
      initialPositions.current![i * 3 + 1] = instance.y;
      initialPositions.current![i * 3 + 2] = instance.z;
    });
  }, [instances]);

  // Gentle wind animation
  useFrame((state) => {
    if (!meshRef.current || !initialPositions.current) return;
    
    const time = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();
    
    instances.forEach((instance, i) => {
      const baseX = initialPositions.current![i * 3];
      const baseY = initialPositions.current![i * 3 + 1];
      const baseZ = initialPositions.current![i * 3 + 2];
      
      // Wind effect - stronger at top, with per-tree variation
      const heightFactor = Math.max(0, (baseY - 3) * 0.1);
      const windStrength = 0.06 * heightFactor;
      const treeOffset = treeOffsets.current[instance.treeIndex] || 0;
      
      const windX = Math.sin(time * 0.7 + treeOffset + baseY * 0.4) * windStrength;
      const windZ = Math.cos(time * 0.5 + treeOffset + baseY * 0.3) * windStrength * 0.6;
      
      dummy.position.set(baseX + windX, baseY, baseZ + windZ);
      dummy.scale.setScalar(instance.scale);
      dummy.rotation.set(
        windZ * 0.3,
        Math.sin(time * 0.2 + treeOffset) * 0.05,
        -windX * 0.3
      );
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const mesh = useMemo(() => {
    if (instances.length === 0) return null;
    
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0.05,
    });
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, instances.length);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const colors = new Float32Array(instances.length * 3);
    
    instances.forEach((instance, i) => {
      dummy.position.set(instance.x, instance.y, instance.z);
      dummy.scale.setScalar(instance.scale);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
      
      // Natural color variation based on tree type
      const palette = TREE_COLORS[instance.type];
      const baseColor = palette[Math.floor(Math.random() * palette.length)];
      color.setHex(baseColor);
      
      // Subtle variation per leaf
      const variation = (Math.random() - 0.5) * 0.1;
      color.r = Math.max(0, Math.min(1, color.r + variation));
      color.g = Math.max(0, Math.min(1, color.g + variation + 0.02));
      color.b = Math.max(0, Math.min(1, color.b + variation));
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    
    return instancedMesh;
  }, [instances]);

  if (!mesh) return null;
  return <primitive object={mesh} ref={meshRef} />;
}
