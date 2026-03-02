'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CameraControllerProps {
  target?: [number, number, number];
  initialPosition?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  maxPolarAngle?: number;
}

/**
 * Camera controller with OrbitControls
 * Supports both mouse and touch interactions
 */
export function CameraController({
  target = [32, 5, 32],
  initialPosition = [60, 40, 60],
  minDistance = 15,
  maxDistance = 100,
  maxPolarAngle = Math.PI / 2 - 0.1, // Don't go below ground
}: CameraControllerProps) {
  const { camera } = useThree();

  useEffect(() => {
    // Set initial camera position
    camera.position.set(...initialPosition);
    camera.lookAt(...target);
  }, [camera, initialPosition, target]);

  return (
    <OrbitControls
      target={new THREE.Vector3(...target)}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={maxPolarAngle}
      enableDamping
      dampingFactor={0.05}
      screenSpacePanning={false}
      zoomSpeed={0.8}
      rotateSpeed={0.8}
      panSpeed={0.8}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}
