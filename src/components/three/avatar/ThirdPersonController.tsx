'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3, MathUtils } from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';

interface ThirdPersonControllerProps {
  url?: string;
  scale?: number;
  getTerrainHeight?: (x: number, z: number) => number;
  speed?: number;
  bounds?: [number, number, number, number];
  startPosition?: [number, number, number];
}

export function ThirdPersonController({
  url = '/avatar.glb',
  scale = 0.6,
  getTerrainHeight,
  speed = 6,
  bounds = [-25, 25, -25, 25],
  startPosition = [0, 2, 0],
}: ThirdPersonControllerProps) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, groupRef);
  const { camera } = useThree();
  
  // Clone scene for unique instance
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  // Input state
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const currentPos = useRef(new Vector3(...startPosition));
  const currentRot = useRef(0);
  const isMoving = useRef(false);
  
  // Camera settings
  const cameraOffset = useRef(new Vector3(0, 4, 8)); // Behind and above
  const cameraTarget = useRef(new Vector3());

  // Setup animations
  useEffect(() => {
    if (!actions) return;
    const idleAnim = actions['idle'] || actions['Idle'];
    if (idleAnim) idleAnim.play();
  }, [actions]);

  // Keyboard input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.current.w = true;
      if (k === 'a' || k === 'arrowleft') keys.current.a = true;
      if (k === 's' || k === 'arrowdown') keys.current.s = true;
      if (k === 'd' || k === 'arrowright') keys.current.d = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.current.w = false;
      if (k === 'a' || k === 'arrowleft') keys.current.a = false;
      if (k === 's' || k === 'arrowdown') keys.current.s = false;
      if (k === 'd' || k === 'arrowright') keys.current.d = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const dt = Math.min(delta, 0.1); // Clamp delta
    const [minX, maxX, minZ, maxZ] = bounds;
    
    // Get input direction (relative to camera)
    let inputX = 0;
    let inputZ = 0;
    if (keys.current.w) inputZ -= 1;
    if (keys.current.s) inputZ += 1;
    if (keys.current.a) inputX -= 1;
    if (keys.current.d) inputX += 1;
    
    // Normalize
    const inputLen = Math.sqrt(inputX * inputX + inputZ * inputZ);
    if (inputLen > 0) {
      inputX /= inputLen;
      inputZ /= inputLen;
      isMoving.current = true;
    } else {
      isMoving.current = false;
    }
    
    // Move relative to camera view (without Y)
    if (isMoving.current) {
      const camDir = new Vector3();
      camera.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();
      
      const camRight = new Vector3(-camDir.z, 0, camDir.x);
      
      const moveDir = new Vector3()
        .addScaledVector(camDir, -inputZ)
        .addScaledVector(camRight, inputX)
        .normalize();
      
      // Update position
      const moveDist = speed * dt;
      const newX = currentPos.current.x + moveDir.x * moveDist;
      const newZ = currentPos.current.z + moveDir.z * moveDist;
      
      // Clamp to bounds
      currentPos.current.x = MathUtils.clamp(newX, minX, maxX);
      currentPos.current.z = MathUtils.clamp(newZ, minZ, maxZ);
      
      // Get terrain height
      if (getTerrainHeight) {
        currentPos.current.y = getTerrainHeight(currentPos.current.x, currentPos.current.z);
      }
      
      // Smooth rotation to face movement
      const targetRot = Math.atan2(moveDir.x, moveDir.z);
      let rotDiff = targetRot - currentRot.current;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      currentRot.current += rotDiff * 10 * dt;
    }
    
    // Apply to group
    groupRef.current.position.copy(currentPos.current);
    groupRef.current.rotation.y = currentRot.current;
    
    // Camera follow (3rd person)
    // Calculate desired camera position (behind character)
    const cos = Math.cos(currentRot.current);
    const sin = Math.sin(currentRot.current);
    
    // Offset relative to character rotation
    const offsetX = -sin * cameraOffset.current.z;
    const offsetZ = -cos * cameraOffset.current.z;
    
    const targetCamPos = new Vector3(
      currentPos.current.x + offsetX,
      currentPos.current.y + cameraOffset.current.y,
      currentPos.current.z + offsetZ
    );
    
    // Smooth camera follow
    camera.position.lerp(targetCamPos, 4 * dt);
    
    // Look at character (slightly above)
    cameraTarget.current.set(
      currentPos.current.x,
      currentPos.current.y + 1.5,
      currentPos.current.z
    );
    camera.lookAt(cameraTarget.current);
    
    // Animations
    const walkAnim = actions['walk'] || actions['Walk'] || actions['run'] || actions['Run'];
    const idleAnim = actions['idle'] || actions['Idle'];
    
    if (isMoving.current) {
      if (walkAnim && !walkAnim.isRunning()) {
        idleAnim?.fadeOut(0.15);
        walkAnim.reset().fadeIn(0.15).play();
      }
    } else {
      if (walkAnim?.isRunning()) {
        walkAnim.fadeOut(0.15);
        idleAnim?.reset().fadeIn(0.15).play();
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
