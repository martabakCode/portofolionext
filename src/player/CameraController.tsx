/**
 * CameraController - Third-Person Camera with Collision
 * 
 * Architecture Pattern: Decorator Pattern (extends Three.js camera)
 * Purpose: Smooth follow camera with obstacle avoidance
 * 
 * Features:
 * - Smooth damping movement
 * - Raycast-based collision prevention
 * - Adjustable zoom via mouse wheel
 * - Orbit around player with mouse
 */

'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Raycaster, Sphere } from 'three';
import { useGameStore } from '@/store/useGameStore';

interface CameraControllerProps {
  target: React.RefObject<{ getPosition: () => Vector3; getRotation: () => number } | null>;
  offset?: Vector3;
  minDistance?: number;
  maxDistance?: number;
  height?: number;
}

const CameraController: React.FC<CameraControllerProps> = ({
  target,
  minDistance = 3,
  maxDistance = 15,
  height = 3,
}) => {
  const { camera, scene } = useThree();
  const cameraState = useRef({
    currentDistance: 8,
    targetDistance: 8,
    currentAngle: 0,
    targetAngle: 0,
    height: height,
    mouseSensitivity: 0.005,
    isDragging: false,
    lastMouseX: 0,
  });

  const raycaster = useRef(new Raycaster());
  const isPaused = useGameStore((state) => state.isPaused);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isPaused) return;
      
      const zoomSpeed = 0.5;
      cameraState.current.targetDistance += e.deltaY * 0.01 * zoomSpeed;
      cameraState.current.targetDistance = Math.max(
        minDistance,
        Math.min(maxDistance, cameraState.current.targetDistance)
      );
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2 || e.button === 1) {
        // Right click or middle click
        cameraState.current.isDragging = true;
        cameraState.current.lastMouseX = e.clientX;
      }
    };

    const handleMouseUp = () => {
      cameraState.current.isDragging = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!cameraState.current.isDragging || isPaused) return;

      const deltaX = e.clientX - cameraState.current.lastMouseX;
      cameraState.current.targetAngle -= deltaX * cameraState.current.mouseSensitivity;
      cameraState.current.lastMouseX = e.clientX;
    };

    // Disable context menu on right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [minDistance, maxDistance, isPaused]);

  // Camera update loop
  useFrame((state, delta) => {
    if (!target.current) return;

    const targetPosition = target.current.getPosition();
    const playerRotation = target.current.getRotation();

    // Smoothly interpolate camera distance
    const dampingFactor = 5 * delta;
    cameraState.current.currentDistance +=
      (cameraState.current.targetDistance - cameraState.current.currentDistance) * dampingFactor;

    // Smoothly interpolate camera angle
    const angleDiff = cameraState.current.targetAngle - cameraState.current.currentAngle;
    cameraState.current.currentAngle += angleDiff * dampingFactor;

    // Calculate ideal camera position (behind player + orbit angle)
    const angle = cameraState.current.currentAngle + playerRotation;
    const idealX = targetPosition.x - Math.sin(angle) * cameraState.current.currentDistance;
    const idealZ = targetPosition.z - Math.cos(angle) * cameraState.current.currentDistance;
    const idealY = targetPosition.y + cameraState.current.height;

    const idealPosition = new Vector3(idealX, idealY, idealZ);

    // Raycast for collision detection
    const direction = new Vector3().subVectors(idealPosition, targetPosition).normalize();
    const distance = targetPosition.distanceTo(idealPosition);

    raycaster.current.set(targetPosition, direction);
    
    // Check for obstacles
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    let finalPosition = idealPosition;

    for (const hit of intersects) {
      // Ignore the player mesh itself
      if (hit.distance < distance && hit.distance > minDistance) {
        // Check if it's not the player
        const objectName = hit.object.name || '';
        if (!objectName.includes('player') && !objectName.includes('Player')) {
          // Adjust camera to just before the obstacle
          const adjustment = 0.5; // Buffer distance
          if (hit.distance - adjustment < cameraState.current.currentDistance) {
            const adjustedDistance = Math.max(minDistance, hit.distance - adjustment);
            const adjustedX = targetPosition.x - Math.sin(angle) * adjustedDistance;
            const adjustedZ = targetPosition.z - Math.cos(angle) * adjustedDistance;
            finalPosition = new Vector3(adjustedX, idealY, adjustedZ);
            break;
          }
        }
      }
    }

    // Apply position with damping for smoothness
    camera.position.lerp(finalPosition, dampingFactor);

    // Look at player
    const lookTarget = new Vector3(targetPosition.x, targetPosition.y + 1.5, targetPosition.z);
    camera.lookAt(lookTarget);
  });

  return null;
};

export default CameraController;
