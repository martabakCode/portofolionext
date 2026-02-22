"use client";

import { RigidBody, CuboidCollider } from "@react-three/rapier";

// Create colliders for main ground platforms
export function GroundColliders() {
  return (
    <>
      {/* Central Plaza Island - Main ground collider */}
      <RigidBody type="fixed" position={[0, -2, 0]}>
        <CuboidCollider args={[120, 2, 120]} />
      </RigidBody>

      {/* Projects Platform */}
      <RigidBody type="fixed" position={[0, 0, -20]}>
        <CuboidCollider args={[12.5, 0.1, 7.5]} />
      </RigidBody>

      {/* Blog Platform */}
      <RigidBody type="fixed" position={[0, 0, 10]}>
        <CuboidCollider args={[10, 0.05, 10]} />
      </RigidBody>

      {/* Main Road */}
      <RigidBody type="fixed" position={[0, 0.05, 0]}>
        <CuboidCollider args={[6, 0.1, 70]} />
      </RigidBody>

      {/* Welcome Plaza Platform */}
      <RigidBody type="fixed" position={[0, 0.05, -5]}>
        <CuboidCollider args={[6, 0.1, 6]} />
      </RigidBody>

      {/* Skills Platform */}
      <RigidBody type="fixed" position={[-15, 0, -5]}>
        <CuboidCollider args={[8, 0.1, 6]} />
      </RigidBody>

      {/* Experience Platform */}
      <RigidBody type="fixed" position={[25, 0, -5]}>
        <CuboidCollider args={[8, 0.1, 30]} />
      </RigidBody>
    </>
  );
}
