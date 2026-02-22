"use client";

import { RigidBody, CuboidCollider } from "@react-three/rapier";

interface CollidableBuildingProps {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  children?: React.ReactNode;
}

export function CollidableBuilding({
  position,
  size,
  color = "#4b5563",
  children,
}: CollidableBuildingProps) {
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      {children}
    </RigidBody>
  );
}
