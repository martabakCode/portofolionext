/**
 * CameraRig - Advanced Third-Person Camera System
 * 
 * Architecture:
 * Player
 *   └── CameraPivot (rotates horizontal & vertical)
 *         └── Camera (offset distance)
 * 
 * Features:
 * - Smooth damping follow
 * - Mouse rotation (yaw/pitch)
 * - Zoom with mouse wheel
 * - Anti-clipping with raycaster
 * - Lock camera on interact
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler, Raycaster, Object3D } from 'three';
import { useGameStore } from '@/store/useGameStore';

interface CameraRigProps {
  target: React.RefObject<{ getPosition: () => Vector3 } | null>;
  minDistance?: number;
  maxDistance?: number;
  defaultDistance?: number;
  height?: number;
  sensitivity?: number;
}

const CameraRig: React.FC<CameraRigProps> = ({
  target,
  minDistance = 3,
  maxDistance = 15,
  defaultDistance = 8,
  height = 2,
  sensitivity = 0.005,
}) => {
  const { camera, scene } = useThree();
  const pivotRef = useRef<Object3D>(new Object3D());
  
  // Camera state
  const cameraState = useRef({
    yaw: 0,
    pitch: 0.3,
    distance: defaultDistance,
    targetDistance: defaultDistance,
    isLocked: false,
    lockedTarget: null as Vector3 | null,
  });

  const isPaused = useGameStore((state) => state.isPaused);
  const isOfficeOpen = useGameStore((state) => state.isOfficeOpen);
  const activeInteraction = useGameStore((state) => state.activeInteraction);

  // Raycaster for collision detection
  const raycaster = useRef(new Raycaster());

  // Setup initial camera
  useEffect(() => {
    camera.position.set(0, height, defaultDistance);
  }, [camera, height, defaultDistance]);

  // Mouse input handler
  useEffect(() => {
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2 || e.button === 1) { // Right or middle click
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || cameraState.current.isLocked || isPaused) return;

      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;

      // Update yaw (horizontal rotation)
      cameraState.current.yaw -= deltaX * sensitivity;

      // Update pitch (vertical rotation) with clamp
      cameraState.current.pitch -= deltaY * sensitivity;
      cameraState.current.pitch = Math.max(
        -Math.PI / 4,  // -45 degrees
        Math.min(Math.PI / 3, cameraState.current.pitch)  // 60 degrees
      );

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleWheel = (e: WheelEvent) => {
      if (isPaused) return;
      
      const zoomSpeed = 0.5;
      cameraState.current.targetDistance += e.deltaY * 0.01 * zoomSpeed;
      cameraState.current.targetDistance = Math.max(
        minDistance,
        Math.min(maxDistance, cameraState.current.targetDistance)
      );
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [sensitivity, minDistance, maxDistance, isPaused]);

  // Lock/unlock camera based on interaction
  useEffect(() => {
    if (isOfficeOpen) {
      cameraState.current.isLocked = true;
      // Lock to building position
      cameraState.current.lockedTarget = new Vector3(15, 2, -10);
      cameraState.current.targetDistance = 5; // Zoom in
    } else {
      cameraState.current.isLocked = false;
      cameraState.current.lockedTarget = null;
      cameraState.current.targetDistance = defaultDistance;
    }
  }, [isOfficeOpen, defaultDistance]);

  // Calculate camera position
  const calculateCameraPosition = useCallback((playerPos: Vector3) => {
    const { yaw, pitch, distance } = cameraState.current;

    // Spherical coordinates to cartesian
    const sinPitch = Math.sin(pitch);
    const cosPitch = Math.cos(pitch);
    const sinYaw = Math.sin(yaw);
    const cosYaw = Math.cos(yaw);

    // Calculate offset from player
    const offsetX = -sinYaw * cosPitch * distance;
    const offsetY = sinPitch * distance + height;
    const offsetZ = -cosYaw * cosPitch * distance;

    return new Vector3(
      playerPos.x + offsetX,
      playerPos.y + offsetY,
      playerPos.z + offsetZ
    );
  }, [height]);

  // Anti-clipping with raycaster
  const preventClipping = useCallback((playerPos: Vector3, idealPos: Vector3) => {
    const direction = new Vector3().subVectors(idealPos, playerPos).normalize();
    const distance = playerPos.distanceTo(idealPos);

    raycaster.current.set(playerPos, direction);
    
    // Check for obstacles (exclude player)
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    
    for (const hit of intersects) {
      const objectName = hit.object.name || '';
      // Skip player and UI elements
      if (objectName.includes('player') || objectName.includes('Player')) continue;
      
      if (hit.distance < distance && hit.distance > minDistance) {
        // Move camera closer before obstacle
        const adjustedDistance = Math.max(minDistance, hit.distance - 0.5);
        const ratio = adjustedDistance / distance;
        return new Vector3().lerpVectors(playerPos, idealPos, ratio);
      }
    }

    return idealPos;
  }, [minDistance, scene]);

  // Main camera update loop - runs after everything else
  useFrame((state, delta) => {
    if (!target.current) return;

    const playerPos = target.current.getPosition();
    const camState = cameraState.current;

    // Smooth zoom transition (faster)
    camState.distance += (camState.targetDistance - camState.distance) * 0.15;

    let targetPosition: Vector3;

    if (camState.isLocked && camState.lockedTarget) {
      // Lock mode: focus on building
      targetPosition = new Vector3()
        .copy(camState.lockedTarget)
        .add(new Vector3(0, height + 2, camState.distance));
      
      camera.lookAt(camState.lockedTarget);
    } else {
      // Normal follow mode
      const idealPosition = calculateCameraPosition(playerPos);
      targetPosition = preventClipping(playerPos, idealPosition);
      
      // Look at player
      const lookTarget = new Vector3(playerPos.x, playerPos.y + 1.5, playerPos.z);
      camera.lookAt(lookTarget);
    }

    // Responsive follow with adaptive damping
    // Higher damping = more responsive, less lag
    const baseDamping = 0.25; // Increased from 0.08
    const distanceToTarget = camera.position.distanceTo(targetPosition);
    
    // If camera is far behind, catch up faster
    const adaptiveDamping = distanceToTarget > 2 
      ? Math.min(0.5, baseDamping + distanceToTarget * 0.05) 
      : baseDamping;
    
    // Use lerp with delta time for frame-rate independence
    const lerpFactor = 1 - Math.exp(-adaptiveDamping * 10 * delta);
    camera.position.lerp(targetPosition, lerpFactor);
  }, -1); // -1 priority = runs after other updates

  return null;
};

export default CameraRig;
