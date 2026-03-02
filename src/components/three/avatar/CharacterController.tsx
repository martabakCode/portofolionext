'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, Box3 } from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';

interface CharacterControllerProps {
  url?: string;
  scale?: number;
  getTerrainHeight?: (x: number, z: number) => number;
  speed?: number;
  bounds?: [number, number, number, number];
  startPosition?: [number, number, number];
}

export function CharacterController({
  url = '/avatar.glb',
  scale = 0.5,
  getTerrainHeight,
  speed = 5,
  bounds = [-30, 30, -30, 30],
  startPosition = [0, 0, 0],
}: CharacterControllerProps) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, groupRef);
  
  // Clone scene untuk instance unik
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  // Movement state
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const currentPos = useRef(new Vector3(...startPosition));
  const targetRotation = useRef(0);
  const isMoving = useRef(false);
  
  // Animation refs
  const walkAnimRef = useRef<ReturnType<typeof useAnimations>['actions'][string] | null>(null);
  const idleAnimRef = useRef<ReturnType<typeof useAnimations>['actions'][string] | null>(null);

  // Setup animations
  useEffect(() => {
    if (!actions) return;
    
    // Find animations
    walkAnimRef.current = actions['walk'] || actions['Walk'] || actions['run'] || actions['Run'] || null;
    idleAnimRef.current = actions['idle'] || actions['Idle'] || null;
    
    // Play idle by default
    if (idleAnimRef.current) {
      idleAnimRef.current.reset().play();
    }
  }, [actions]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keys.current.w = true;
      if (key === 'a' || key === 'arrowleft') keys.current.a = true;
      if (key === 's' || key === 'arrowdown') keys.current.s = true;
      if (key === 'd' || key === 'arrowright') keys.current.d = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keys.current.w = false;
      if (key === 'a' || key === 'arrowleft') keys.current.a = false;
      if (key === 's' || key === 'arrowdown') keys.current.s = false;
      if (key === 'd' || key === 'arrowright') keys.current.d = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const [minX, maxX, minZ, maxZ] = bounds;
    
    // Calculate movement
    let moveX = 0;
    let moveZ = 0;

    if (keys.current.w) moveZ -= 1;
    if (keys.current.s) moveZ += 1;
    if (keys.current.a) moveX -= 1;
    if (keys.current.d) moveX += 1;

    // Normalize diagonal
    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= length;
      moveZ /= length;
      isMoving.current = true;
    } else {
      isMoving.current = false;
    }

    // Update position
    const moveSpeed = speed * delta;
    currentPos.current.x = Math.max(minX, Math.min(maxX, currentPos.current.x + moveX * moveSpeed));
    currentPos.current.z = Math.max(minZ, Math.min(maxZ, currentPos.current.z + moveZ * moveSpeed));

    // Get terrain height
    if (getTerrainHeight) {
      currentPos.current.y = getTerrainHeight(currentPos.current.x, currentPos.current.z);
    }

    // Rotation
    if (moveX !== 0 || moveZ !== 0) {
      targetRotation.current = Math.atan2(moveX, moveZ);
    }

    // Smooth rotation
    const currentY = groupRef.current.rotation.y;
    let diff = targetRotation.current - currentY;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    groupRef.current.rotation.y = currentY + diff * 8 * delta;

    // Apply position
    groupRef.current.position.copy(currentPos.current);

    // Handle animations
    if (isMoving.current) {
      if (walkAnimRef.current && !walkAnimRef.current.isRunning()) {
        idleAnimRef.current?.fadeOut(0.2);
        walkAnimRef.current.reset().fadeIn(0.2).play();
      }
    } else {
      if (walkAnimRef.current?.isRunning()) {
        walkAnimRef.current.fadeOut(0.2);
        idleAnimRef.current?.reset().fadeIn(0.2).play();
      }
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload('/avatar.glb');
