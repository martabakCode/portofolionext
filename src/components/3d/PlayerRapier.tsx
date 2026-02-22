"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  RigidBody,
  CapsuleCollider,
  useRapier,
} from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

interface PlayerRapierProps {
  locked: boolean;
  isDriving: boolean;
}

const SPEED = 5;
const SPRINT_MULTIPLIER = 1.8;
const JUMP_FORCE = 8;
const PLAYER_HEIGHT = 1.7;

export default function PlayerRapier({
  locked,
  isDriving,
}: PlayerRapierProps) {
  const { camera } = useThree();
  const [, get] = useKeyboardControls();
  const rigidBodyRef = useRef<React.ElementRef<typeof RigidBody>>(null);
  const { rapier, world } = useRapier();

  // Movement state
  const canJump = useRef(true);

  // Store last position for car transitions
  const lastPosition = useRef(new THREE.Vector3(0, PLAYER_HEIGHT, 5));

  // Handle car transition
  useEffect(() => {
    if (!rigidBodyRef.current) return;

    if (!isDriving) {
      // Reset velocity when exiting car
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rigidBodyRef.current.setTranslation(
        {
          x: lastPosition.current.x,
          y: PLAYER_HEIGHT,
          z: lastPosition.current.z,
        },
        true
      );
    }
  }, [isDriving]);

  useFrame((_state, delta) => {
    if (!rigidBodyRef.current || isDriving || !locked) return;

    const { forward, backward, left, right, sprint, jump } = get();
    const speed = (sprint ? SPRINT_MULTIPLIER : 1) * SPEED;

    // Get current position and velocity
    const position = rigidBodyRef.current.translation();
    const currentVel = rigidBodyRef.current.linvel();

    // --- Horizontal Movement ---
    const direction = new THREE.Vector3(0, 0, 0);
    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (left) direction.x -= 1;
    if (right) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();

      // Get camera direction for movement
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      const cameraRight = new THREE.Vector3();
      cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

      // Calculate movement vector
      const moveVector = new THREE.Vector3();
      moveVector.addScaledVector(cameraDirection, -direction.z * speed);
      moveVector.addScaledVector(cameraRight, direction.x * speed);

      // Apply velocity
      rigidBodyRef.current.setLinvel(
        { x: moveVector.x, y: currentVel.y, z: moveVector.z },
        true
      );
    } else {
      // Stop horizontal movement
      rigidBodyRef.current.setLinvel(
        { x: 0, y: currentVel.y, z: 0 },
        true
      );
    }

    // --- Jump ---
    if (jump && canJump.current) {
      // Check if grounded using raycast
      const ray = world.castRay(
        new rapier.Ray(
          { x: position.x, y: position.y, z: position.z },
          { x: 0, y: -1, z: 0 }
        ),
        PLAYER_HEIGHT + 0.1,
        true
      );

      if (ray && ray.timeOfImpact < PLAYER_HEIGHT + 0.2) {
        rigidBodyRef.current.applyImpulse(
          { x: 0, y: JUMP_FORCE, z: 0 },
          true
        );
        canJump.current = false;
        setTimeout(() => {
          canJump.current = true;
        }, 500);
      }
    }

    // --- Camera Follow ---
    camera.position.x = position.x;
    camera.position.z = position.z;
    camera.position.y = position.y + PLAYER_HEIGHT * 0.5;

    // Clamp to world bounds
    const clampedPos = {
      x: Math.max(-150, Math.min(150, position.x)),
      y: position.y,
      z: Math.max(-150, Math.min(150, position.z)),
    };

    if (position.x !== clampedPos.x || position.z !== clampedPos.z) {
      rigidBodyRef.current.setTranslation(clampedPos, true);
    }

    // Save position
    lastPosition.current.set(position.x, position.y, position.z);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      position={[0, PLAYER_HEIGHT, 5]}
      enabledRotations={[false, false, false]}
      linearDamping={0.5}
      angularDamping={1}
      friction={0.5}
      restitution={0}
      colliders={false}
    >
      <CapsuleCollider args={[PLAYER_HEIGHT * 0.4, 0.4]} />
    </RigidBody>
  );
}
