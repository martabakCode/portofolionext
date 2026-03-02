'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface CloudProps {
  count?: number;
  area?: number;
  height?: number;
}

interface CloudData {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
}

/**
 * Floating voxel clouds
 */
export function Clouds({ count = 8, area = 60, height = 20 }: CloudProps) {
  const clouds = useMemo<CloudData[]>(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * area,
      y: height + Math.random() * 8,
      z: (Math.random() - 0.5) * area,
      scale: 0.8 + Math.random() * 0.6,
      rotation: Math.random() * Math.PI * 2,
    }));
  }, [count, area, height]);

  return (
    <group>
      {clouds.map((cloud, i) => (
        <Cloud key={i} {...cloud} />
      ))}
    </group>
  );
}

function Cloud({ x, y, z, scale, rotation }: CloudData) {
  const mesh = useMemo(() => {
    // Create a cloud from multiple spheres
    const cloudParts: { x: number; y: number; z: number; radius: number }[] = [];
    
    // Main cloud body
    const numParts = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numParts; i++) {
      cloudParts.push({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 3,
        radius: 1 + Math.random() * 1.5,
      });
    }
    
    // Create instanced mesh for all cloud parts
    const geometry = new THREE.SphereGeometry(1, 8, 6);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      roughness: 1,
    });
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, cloudParts.length);
    instancedMesh.castShadow = true;
    
    const dummy = new THREE.Object3D();
    
    cloudParts.forEach((part, i) => {
      dummy.position.set(part.x, part.y, part.z);
      dummy.scale.setScalar(part.radius);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    });
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    
    return instancedMesh;
  }, []);

  return (
    <primitive
      object={mesh}
      position={[x, y, z]}
      scale={scale}
      rotation={[0, rotation, 0]}
    />
  );
}
