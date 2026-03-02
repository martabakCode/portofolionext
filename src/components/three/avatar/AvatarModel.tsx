'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { Group } from 'three';

interface AvatarModelProps {
  /** URL path to the GLB file */
  url?: string;
  /** Scale of the avatar */
  scale?: number;
  /** Position of the avatar */
  position?: [number, number, number];
  /** Rotation of the avatar (in radians) */
  rotation?: [number, number, number];
  /** Auto-rotate the avatar */
  autoRotate?: boolean;
  /** Animation to play (if available in the model) */
  animationName?: string;
  /** Enable idle floating animation */
  floatAnimation?: boolean;
}

/**
 * AvatarModel - Loads and displays a GLB/GLTF 3D avatar
 * 
 * Features:
 * - Loads GLB files using useGLTF
 * - Supports animations via useAnimations
 * - Optional auto-rotation
 * - Optional floating idle animation
 * - Proper cleanup on unmount
 */
export function AvatarModel({
  url = '/avatar.glb',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotate = false,
  animationName,
  floatAnimation = true,
}: AvatarModelProps) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Play animation if specified and available
  useEffect(() => {
    if (animationName && actions[animationName]) {
      actions[animationName].play();
    } else if (animations.length > 0 && !animationName) {
      // Play first animation by default if no specific name given
      const firstAnim = Object.values(actions)[0];
      if (firstAnim) firstAnim.play();
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [actions, animationName, animations, mixer]);

  // Auto-rotation and floating animation
  useFrame((state) => {
    if (!groupRef.current) return;

    // Auto-rotate
    if (autoRotate) {
      groupRef.current.rotation.y += 0.005;
    }

    // Floating idle animation
    if (floatAnimation) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

// Preload the default avatar
useGLTF.preload('/avatar.glb');
