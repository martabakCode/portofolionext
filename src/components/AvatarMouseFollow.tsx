'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3, Box3, Color } from 'three';

interface AvatarMouseFollowProps {
  /** Scale of the avatar */
  scale?: number;
  /** Position offset */
  position?: [number, number, number];
  /** Rotation speed */
  followSpeed?: number;
  /** Max rotation angle in radians */
  maxRotation?: number;
}

export function AvatarMouseFollow({
  scale = 1,
  position = [0, 0, 0],
  followSpeed = 4,
  maxRotation = 0.8,
}: AvatarMouseFollowProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/avatar.glb');
  const mousePos = useRef({ x: 0, y: 0 });
  
  // Track mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Prepare model
  const avatarModel = useMemo(() => {
    if (!scene) return null;
    
    const clone = scene.clone();
    const box = new Box3().setFromObject(clone);
    const center = box.getCenter(new Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);
    
    clone.traverse((child) => {
      if ((child as any).isMesh) {
        (child as any).visible = true;
        (child as any).castShadow = true;
        if ((child as any).material) {
          const mat = (child as any).material.clone();
          mat.color = new Color(1, 0.85, 0.7);
          mat.emissive = new Color(0.1, 0.05, 0);
          mat.emissiveIntensity = 0.15;
          (child as any).material = mat;
        }
      }
    });
    
    return { mesh: clone, size: box.getSize(new Vector3()) };
  }, [scene]);
  
  // Animation - follow mouse
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const dt = Math.min(delta, 0.1);
    
    // Calculate target rotation based on mouse X
    const targetRot = Math.max(-maxRotation, Math.min(maxRotation, mousePos.current.x * maxRotation));
    
    // Smooth rotation
    const currentRot = groupRef.current.rotation.y;
    let diff = targetRot - currentRot;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    groupRef.current.rotation.y += diff * followSpeed * dt;
    
    // Idle breathing animation
    const time = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.03;
  });
  
  const finalScale = avatarModel ? scale * Math.max(0.5, 1.2 / avatarModel.size.y) : scale;
  
  return (
    <group ref={groupRef} position={position} scale={finalScale}>
      {avatarModel ? (
        <primitive object={avatarModel.mesh} />
      ) : (
        <mesh>
          <capsuleGeometry args={[0.5, 1.5, 4, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
      )}
      
      {/* Shadow */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color="black" opacity={0.25} transparent />
      </mesh>
    </group>
  );
}

useGLTF.preload('/avatar.glb');
