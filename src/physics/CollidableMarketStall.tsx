"use client";

import { RigidBody, CuboidCollider } from "@react-three/rapier";

interface CollidableMarketStallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  roofColor?: string;
}

export function CollidableMarketStall({
  position,
  rotation = [0, 0, 0],
  roofColor = "#ef4444",
}: CollidableMarketStallProps) {
  return (
    <RigidBody
      type="fixed"
      position={position}
      rotation={rotation}
      colliders={false}
    >
      {/* Table collider */}
      <CuboidCollider args={[1.5, 0.5, 1]} position={[0, 0.5, 0]} />

      {/* Visual table */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 1, 2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Roof poles */}
      <mesh position={[-1.3, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[1.3, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[3.5, 0.1, 2.5]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
    </RigidBody>
  );
}
