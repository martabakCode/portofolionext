"use client";

import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";

interface PlayerProps {
    locked: boolean;
    isDriving: boolean;
}

const SPEED = 5;
const SPRINT_MULTIPLIER = 1.8;
const JUMP_FORCE = 8;
const GRAVITY = 20;

export default function Player({ locked, isDriving }: PlayerProps) {
    const { camera } = useThree();
    const [sub, get] = useKeyboardControls();
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const isGrounded = useRef(true);

    // Store last position before entering car
    const lastPosition = useRef(new THREE.Vector3(0, 1.7, 5));
    const lastRotation = useRef(new THREE.Euler(0, 0, 0));

    // Save position when switching to driving
    useEffect(() => {
        if (isDriving) {
            lastPosition.current.copy(camera.position);
            lastRotation.current.copy(camera.rotation);
        } else {
            // Restore position when exiting car (offset from car)
            camera.position.copy(lastPosition.current);
            camera.rotation.copy(lastRotation.current);
            velocity.current.set(0, 0, 0); // Reset velocity
        }
    }, [isDriving, camera]);

    // Ensure camera is at correct height when walking
    useEffect(() => {
        if (!isDriving && !locked) {
            camera.position.y = 1.7;
            velocity.current.set(0, 0, 0);
        }
    }, [isDriving, locked, camera]);

    useFrame((_state, delta) => {
        if (isDriving || !locked) return; // Don't move player when driving or paused

        const { forward, backward, left, right, sprint, jump } = get();

        const speed = (sprint ? SPRINT_MULTIPLIER : 1) * SPEED;

        // --- Horizontal Movement ---
        direction.current.set(0, 0, 0);
        if (forward) direction.current.z -= 1;
        if (backward) direction.current.z += 1;
        if (left) direction.current.x -= 1;
        if (right) direction.current.x += 1;

        if (direction.current.length() > 0) {
            direction.current.normalize().multiplyScalar(speed * delta);
            const cameraDirection = new THREE.Vector3();
            camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0;
            cameraDirection.normalize();

            const cameraRight = new THREE.Vector3();
            cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

            const moveVector = new THREE.Vector3();
            moveVector.addScaledVector(cameraDirection, -direction.current.z);
            moveVector.addScaledVector(cameraRight, direction.current.x);
            camera.position.add(moveVector);
        }

        // --- Vertical Movement (Jump & Gravity) ---
        // Apply Gravity
        if (!isGrounded.current) {
            velocity.current.y -= GRAVITY * delta;
        }

        // Apply Velocity to Position
        camera.position.y += velocity.current.y * delta;

        // Ground Collision
        if (camera.position.y <= 1.7) {
            camera.position.y = 1.7;
            velocity.current.y = 0;
            isGrounded.current = true;
        } else {
            isGrounded.current = false;
        }

        // Jump Impulse
        if (jump && isGrounded.current) {
            velocity.current.y = JUMP_FORCE;
            isGrounded.current = false;
        }

        // Clamp horizontal position to world bounds
        camera.position.x = Math.max(-150, Math.min(150, camera.position.x));
        camera.position.z = Math.max(-150, Math.min(150, camera.position.z));

        // Save current position
        lastPosition.current.copy(camera.position);
        lastRotation.current.copy(camera.rotation);
    });

    return null;
}
