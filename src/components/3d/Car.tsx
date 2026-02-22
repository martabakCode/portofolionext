"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface CarProps {
    isDriving: boolean;
    onExitCar: () => void;
}

export default function Car({ isDriving, onExitCar }: CarProps) {
    const carRef = useRef<THREE.Group>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const { camera } = useThree();
    const [sub, get] = useKeyboardControls();

    // Car physics state
    const velocity = useRef(0);
    const steering = useRef(0);
    const carPosition = useRef(new THREE.Vector3(0, 0.5, 0));
    const carRotation = useRef(0);

    // Car settings
    const MAX_SPEED = 20;
    const ACCELERATION = 12;
    const DECELERATION = 8;
    const TURN_SPEED = 2.5;

    // Smooth camera state
    const currentLookAt = useRef(new THREE.Vector3());

    // Exit car with E key, Reset with R
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isDriving) return;

            const key = e.key.toLowerCase();
            if (key === 'e') {
                onExitCar();
            }
            if (key === 'r') {
                // Reset car position
                carPosition.current.set(0, 0.5, 0);
                carRotation.current = 0;
                velocity.current = 0;
                steering.current = 0;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDriving, onExitCar]);

    useFrame((state, delta) => {
        if (!carRef.current || !isDriving) return;

        const { forward, backward, left, right, brake } = get();

        // Acceleration logic
        if (forward) {
            velocity.current = Math.min(velocity.current + ACCELERATION * delta, MAX_SPEED);
        } else if (backward) {
            velocity.current = Math.max(velocity.current - ACCELERATION * delta, -MAX_SPEED / 2);
        } else {
            // Friction / Deceleration
            if (velocity.current > 0) {
                velocity.current = Math.max(velocity.current - DECELERATION * delta, 0);
            } else if (velocity.current < 0) {
                velocity.current = Math.min(velocity.current + DECELERATION * delta, 0);
            }
        }

        // Steering logic
        if (left) {
            steering.current += TURN_SPEED * delta;
        } else if (right) {
            steering.current -= TURN_SPEED * delta;
        } else {
            // Auto-center steering
            steering.current = THREE.MathUtils.lerp(steering.current, 0, delta * 5);
        }

        // Clamp steering
        steering.current = THREE.MathUtils.clamp(steering.current, -0.6, 0.6);

        // Apply rotation (only when moving)
        if (Math.abs(velocity.current) > 0.1) {
            const dir = velocity.current > 0 ? 1 : -1;
            carRotation.current += steering.current * dir * delta * 2.5;
        }

        // Calculate motion vector
        const xDir = Math.sin(carRotation.current);
        const zDir = Math.cos(carRotation.current);

        // Update position
        carPosition.current.x += xDir * velocity.current * delta;
        carPosition.current.z += zDir * velocity.current * delta;

        // Apply transforms
        carRef.current.position.copy(carPosition.current);
        carRef.current.rotation.y = carRotation.current;

        // Camera Logic
        const camDist = 8;
        const camHeight = 3.5;

        const idealCamPos = new THREE.Vector3(
            carPosition.current.x - Math.sin(carRotation.current) * camDist,
            carPosition.current.y + camHeight,
            carPosition.current.z - Math.cos(carRotation.current) * camDist
        );

        // Smoothly move camera
        state.camera.position.lerp(idealCamPos, delta * 4);

        // Smoothly look at target
        const targetLookAt = new THREE.Vector3(
            carPosition.current.x + Math.sin(carRotation.current) * 5,
            carPosition.current.y,
            carPosition.current.z + Math.cos(carRotation.current) * 5
        );

        currentLookAt.current.lerp(targetLookAt, delta * 5);
        state.camera.lookAt(currentLookAt.current);
    });

    // Helper Components for Lego Car
    const LegoWheel = ({ position }: { position: [number, number, number] }) => (
        <group position={position} rotation={[0, 0, Math.PI / 2]}>
            {/* Tire */}
            <mesh castShadow>
                <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
            </mesh>
            {/* Rim */}
            <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.25, 16]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.5} />
            </mesh>
        </group>
    );

    const LegoStud = ({ position }: { position: [number, number, number] }) => (
        <mesh position={position}>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
            <meshStandardMaterial color="#dc2626" />
        </mesh>
    );

    return (
        <group ref={carRef} position={[0, 0.5, 0]} castShadow>
            {/* Chassis */}
            <mesh position={[0, 0.2, 0]} castShadow>
                <boxGeometry args={[2, 0.4, 4]} />
                <meshStandardMaterial color="#333" />
            </mesh>

            {/* Body */}
            <mesh position={[0, 0.6, 0]} castShadow>
                <boxGeometry args={[2, 0.4, 4]} />
                <meshStandardMaterial color="#dc2626" /> // Red Body
            </mesh>

            {/* Windshield */}
            <mesh position={[0, 1.2, 0.5]} castShadow>
                <boxGeometry args={[1.8, 0.8, 1.5]} />
                <meshPhysicalMaterial
                    color="#a5f3fc"
                    transparent
                    opacity={0.6}
                    roughness={0}
                    transmission={0.5}
                    thickness={0.5}
                />
            </mesh>

            {/* Roof */}
            <mesh position={[0, 1.65, 0.5]} castShadow>
                <boxGeometry args={[1.8, 0.1, 1.5]} />
                <meshStandardMaterial color="#dc2626" />
            </mesh>

            {/* Spoiler */}
            <mesh position={[0, 1.0, -1.8]} castShadow>
                <boxGeometry args={[1.8, 0.1, 0.5]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Wheels */}
            <LegoWheel position={[-1.1, 0.2, 1.2]} />
            <LegoWheel position={[1.1, 0.2, 1.2]} />
            <LegoWheel position={[-1.1, 0.2, -1.2]} />
            <LegoWheel position={[1.1, 0.2, -1.2]} />

            {/* Headlights */}
            <mesh position={[-0.6, 0.6, 2.05]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
                <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.6, 0.6, 2.05]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
                <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={2} />
            </mesh>

            {/* Taillights */}
            <mesh position={[-0.6, 0.6, -2.05]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
                <meshStandardMaterial color="red" emissive="red" emissiveIntensity={1} />
            </mesh>
            <mesh position={[0.6, 0.6, -2.05]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
                <meshStandardMaterial color="red" emissive="red" emissiveIntensity={1} />
            </mesh>

            {/* Studs on hood */}
            <LegoStud position={[-0.5, 0.85, 1.5]} />
            <LegoStud position={[0.5, 0.85, 1.5]} />

            {/* Shadow */}
            <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.5, 4.5]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.4} />
            </mesh>

            <spotLight
                position={[0, 1, 2]}
                target-position={[0, 0, 10]}
                angle={Math.PI / 6}
                penumbra={0.2}
                intensity={isDriving ? 3 : 0}
                distance={30}
                castShadow
            />
        </group>
    );
}
