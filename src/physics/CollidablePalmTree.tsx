"use client";

import { RigidBody, CylinderCollider } from "@react-three/rapier";

interface CollidablePalmTreeProps {
  position: [number, number, number];
  trunkRadius?: number;
  trunkHeight?: number;
}

export function CollidablePalmTree({
  position,
  trunkRadius = 0.3,
  trunkHeight = 8,
}: CollidablePalmTreeProps) {
  return (
    <group position={position}>
      {/* Collision trunk */}
      <RigidBody
        type="fixed"
        position={[0, trunkHeight / 2, 0]}
        colliders={false}
      >
        <CylinderCollider args={[trunkHeight / 2, trunkRadius]} />
      </RigidBody>

      {/* Visual trunk */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow>
        <cylinderGeometry
          args={[trunkRadius, trunkRadius * 1.3, trunkHeight, 8]}
        />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* Leaves - no collision needed */}
      <mesh position={[0, trunkHeight, 0]}>
        <coneGeometry args={[3, 4, 8]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
    </group>
  );
}
