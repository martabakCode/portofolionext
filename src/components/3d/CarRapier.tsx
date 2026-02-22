"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  RigidBody,
  CuboidCollider,
  useRapier,
} from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

interface CarRapierProps {
  isDriving: boolean;
  onExitCar: () => void;
}

const MAX_SPEED = 20;
const ACCELERATION = 15;
const TURN_SPEED = 2.5;
const CAR_MASS = 1000;

export default function CarRapier({ isDriving, onExitCar }: CarRapierProps) {
  const carRef = useRef<THREE.Group>(null);
  const rigidBodyRef = useRef<React.ElementRef<typeof RigidBody>>(null);
  const { camera } = useThree();
  const [, get] = useKeyboardControls();
  const { world } = useRapier();

  // Car state
  const steering = useRef(0);
  const currentSpeed = useRef(0);
  const currentLookAt = useRef(new THREE.Vector3());

  // Exit car with E key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDriving) return;
      if (e.key.toLowerCase() === "e") {
        onExitCar();
      }
      if (e.key.toLowerCase() === "r") {
        // Reset car
        rigidBodyRef.current?.setTranslation({ x: 0, y: 1, z: 0 }, true);
        rigidBodyRef.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBodyRef.current?.setAngvel({ x: 0, y: 0, z: 0 }, true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDriving, onExitCar]);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || !isDriving) return;

    const { forward, backward, left, right, brake } = get();
    const position = rigidBodyRef.current.translation();
    const rotation = rigidBodyRef.current.rotation();
    const velocity = rigidBodyRef.current.linvel();

    // Calculate current speed
    currentSpeed.current = Math.sqrt(
      velocity.x * velocity.x + velocity.z * velocity.z
    );

    // --- Acceleration ---
    const forwardDir = new THREE.Vector3(0, 0, -1);
    forwardDir.applyQuaternion(
      new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    );
    forwardDir.y = 0;
    forwardDir.normalize();

    if (forward) {
      rigidBodyRef.current.applyImpulse(
        {
          x: forwardDir.x * ACCELERATION,
          y: 0,
          z: forwardDir.z * ACCELERATION,
        },
        true
      );
    } else if (backward) {
      rigidBodyRef.current.applyImpulse(
        {
          x: -forwardDir.x * ACCELERATION * 0.5,
          y: 0,
          z: -forwardDir.z * ACCELERATION * 0.5,
        },
        true
      );
    }

    // --- Steering ---
    if (left) {
      steering.current = Math.min(
        steering.current + TURN_SPEED * delta,
        0.6
      );
    } else if (right) {
      steering.current = Math.max(
        steering.current - TURN_SPEED * delta,
        -0.6
      );
    } else {
      steering.current = THREE.MathUtils.lerp(steering.current, 0, delta * 5);
    }

    // Apply steering torque when moving
    if (currentSpeed.current > 0.5) {
      const turnDirection = velocity.z > 0 ? -1 : 1;
      rigidBodyRef.current.applyTorqueImpulse(
        {
          x: 0,
          y: steering.current * turnDirection * 2,
          z: 0,
        },
        true
      );
    }

    // --- Brake ---
    if (brake) {
      rigidBodyRef.current.setLinvel(
        {
          x: velocity.x * 0.95,
          y: velocity.y,
          z: velocity.z * 0.95,
        },
        true
      );
    }

    // --- Speed Limit ---
    if (currentSpeed.current > MAX_SPEED) {
      const scale = MAX_SPEED / currentSpeed.current;
      rigidBodyRef.current.setLinvel(
        {
          x: velocity.x * scale,
          y: velocity.y,
          z: velocity.z * scale,
        },
        true
      );
    }

    // --- Camera Follow ---
    const carPos = new THREE.Vector3(position.x, position.y, position.z);
    const carRot = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    );

    const camDist = 8;
    const camHeight = 3.5;

    const idealCamPos = new THREE.Vector3(
      carPos.x - Math.sin(carRot.y) * camDist,
      carPos.y + camHeight,
      carPos.z - Math.cos(carRot.y) * camDist
    );

    state.camera.position.lerp(idealCamPos, delta * 4);

    const targetLookAt = new THREE.Vector3(
      carPos.x + Math.sin(carRot.y) * 5,
      carPos.y,
      carPos.z + Math.cos(carRot.y) * 5
    );

    currentLookAt.current.lerp(targetLookAt, delta * 5);
    state.camera.lookAt(currentLookAt.current);

    // Update visual mesh
    if (carRef.current) {
      carRef.current.position.set(position.x, position.y, position.z);
      carRef.current.quaternion.set(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
      );
    }
  });

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        type="dynamic"
        position={[0, 0.5, 0]}
        rotation={[0, 0, 0]}
        linearDamping={0.5}
        angularDamping={0.8}
        friction={0.8}
        restitution={0.1}
        mass={CAR_MASS}
        colliders={false}
      >
        <CuboidCollider args={[1, 0.5, 2]} position={[0, 0.3, 0]} />
      </RigidBody>

      {/* Visual Car Mesh */}
      <group ref={carRef} position={[0, 0.5, 0]}>
        {/* Chassis */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[2, 0.4, 4]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* Body */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2, 0.4, 4]} />
          <meshStandardMaterial color="#dc2626" />
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
        <CarWheel position={[-1.1, 0.2, 1.2]} />
        <CarWheel position={[1.1, 0.2, 1.2]} />
        <CarWheel position={[-1.1, 0.2, -1.2]} />
        <CarWheel position={[1.1, 0.2, -1.2]} />

        {/* Headlights */}
        <mesh position={[-0.6, 0.6, 2.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
          <meshStandardMaterial
            color="yellow"
            emissive="yellow"
            emissiveIntensity={isDriving ? 2 : 0}
          />
        </mesh>
        <mesh position={[0.6, 0.6, 2.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
          <meshStandardMaterial
            color="yellow"
            emissive="yellow"
            emissiveIntensity={isDriving ? 2 : 0}
          />
        </mesh>

        {/* Taillights */}
        <mesh position={[-0.6, 0.6, -2.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
          <meshStandardMaterial
            color="red"
            emissive="red"
            emissiveIntensity={isDriving ? 1 : 0}
          />
        </mesh>
        <mesh position={[0.6, 0.6, -2.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
          <meshStandardMaterial
            color="red"
            emissive="red"
            emissiveIntensity={isDriving ? 1 : 0}
          />
        </mesh>

        {/* Studs on hood */}
        <mesh position={[-0.5, 0.85, 1.5]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0.5, 0.85, 1.5]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>

        {/* Headlight spotlight */}
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
    </>
  );
}

// Wheel component
function CarWheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.25, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.5} />
      </mesh>
    </group>
  );
}
