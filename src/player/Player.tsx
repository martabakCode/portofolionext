/**
 * Player - 3D Player Component
 */

'use client';

import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { useGameStore } from '@/store/useGameStore';
import { PlayerController } from './PlayerController';
import { gameManager } from '@/core/GameManager';
import CharacterModel from './CharacterModel';

export interface PlayerRef {
  getPosition: () => Vector3;
  getRotation: () => number;
}

const Player = forwardRef<PlayerRef>((_, ref) => {
  const meshRef = useRef<Group>(null);
  const controllerRef = useRef<PlayerController | null>(null);
  const [position, setPosition] = useState(new Vector3(0, 2, 20));
  const [rotation, setRotation] = useState(0);

  const isPaused = useGameStore((state) => state.isPaused);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setPlayerRotation = useGameStore((state) => state.setPlayerRotation);
  const setPlayerState = useGameStore((state) => state.setPlayerState);

  // Initialize controller
  useEffect(() => {
    controllerRef.current = new PlayerController();
    controllerRef.current.initialize();

    return () => {
      controllerRef.current?.dispose();
    };
  }, []);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    getPosition: () => position.clone(),
    getRotation: () => rotation,
  }));

  // Update loop
  useFrame((state, delta) => {
    if (!controllerRef.current || isPaused) return;

    const camDir = new Vector3();
    state.camera.getWorldDirection(camDir);
    // atan2(x, z) gives angle from North (Z-)? 
    // South Camera (0, 0, 10) looking (0, 0, -1) -> (0, -1). atan2(0, -1) = PI.
    // We want 0 rotation for South Camera (North movement).
    // So we invoke update with PI offset? Or check PlayerController?
    // PlayerController rotates input by this angle.
    // If input is (0, -1). Rotated 180 is (0, 1) -> South.
    // We want North. So we need 0 rot.
    // So we need PI + PI = 0.
    // So pass atan2(x, z) + Math.PI?
    // Let's try raw atan2 first. If inverted, I will change it.
    // Actually, common pattern is:
    // angle = atan2(x, z);
    // input rotated by angle.
    // If angle is PI. Input (Fwd) becomes Back.
    // So yes, likely need offset.
    const camRot = Math.atan2(camDir.x, camDir.z) + Math.PI;

    controllerRef.current.update(delta, camRot);

    const newPos = controllerRef.current.getPosition();
    const newRot = controllerRef.current.getRotation();
    const stateMachine = controllerRef.current.getStateMachine();

    // Update local state
    setPosition(newPos.clone());
    setRotation(newRot);

    // Update group directly
    if (meshRef.current) {
      meshRef.current.position.copy(newPos);
      meshRef.current.rotation.y = newRot;
    }

    // Sync with store
    setPlayerPosition(newPos);
    setPlayerRotation(newRot);
    setPlayerState(stateMachine.getState());

    // Sync with GameManager
    gameManager.updatePlayerPosition(newPos);
    gameManager.updatePlayerState(stateMachine.getState());
  });

  return (
    <group>
      {/* Player Root Group controlled by Physics */}
      <group
        ref={meshRef}
        position={[0, 2, 20]} // Initial position
        name="player-root"
      >
        <CharacterModel />

        {/* Simple Shadow/Ground Indicator */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.4, 32]} />
          <meshBasicMaterial color="black" transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
});

Player.displayName = 'Player';

export default Player;
