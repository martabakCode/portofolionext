"use client";

import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Text } from "@react-three/drei";

interface CollidableShopProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  signColor?: string;
  signText?: string;
}

export function CollidableShop({
  position,
  rotation = [0, 0, 0],
  color = "#4b5563",
  signColor = "#fca5a5",
  signText = "Shop",
}: CollidableShopProps) {
  return (
    <RigidBody
      type="fixed"
      position={position}
      rotation={rotation}
      colliders={false}
    >
      {/* Main building collider */}
      <CuboidCollider args={[3, 2.5, 3]} position={[0, 2.5, 0]} />

      {/* Floating Island Base */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[5, 1, 2, 7]} />
        <meshStandardMaterial color="#A8A29E" />
      </mesh>

      {/* Visual building */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 5, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <coneGeometry args={[4.5, 2, 4]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Sign */}
      <Text
        position={[0, 4, 3.2]}
        fontSize={0.5}
        color={signColor}
        anchorX="center"
      >
        {signText}
      </Text>
    </RigidBody>
  );
}
