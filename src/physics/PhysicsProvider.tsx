"use client";

import { Physics } from "@react-three/rapier";

interface PhysicsProviderProps {
  children: React.ReactNode;
  debug?: boolean;
}

export function PhysicsProvider({
  children,
}: PhysicsProviderProps) {
  return (
    <Physics
      gravity={[0, -20, 0]} // Match current GRAVITY constant
      timeStep="vary"
      paused={false}
    >
      {children}
    </Physics>
  );
}
