/**
 * CoastalOffice - Simple Building
 */

'use client';

import { useEffect, useRef } from 'react';
import { Mesh } from 'three';
import { interactionSystem } from '@/core/InteractionSystem';
import { useGameStore } from '@/store/useGameStore';
import { Vector3 } from 'three';

const CoastalOffice: React.FC = () => {
  const buildingRef = useRef<Mesh>(null);
  const activeInteraction = useGameStore((state) => state.activeInteraction);
  const openOffice = useGameStore((state) => state.openOffice);
  const isActive = activeInteraction === 'coastal-office';

  useEffect(() => {
    // Register interaction
    interactionSystem.register({
      id: 'coastal-office',
      position: new Vector3(15, 0, -10),
      radius: 4,
      promptText: 'Press E to enter Coastal Office',
      onInteract: () => {
        openOffice();
      },
    });

    return () => {
      interactionSystem.unregister('coastal-office');
    };
  }, [openOffice]);

  return (
    <group position={[15, 0, -10]} name="coastal-office">
      {/* Main building */}
      <mesh ref={buildingRef} position={[0, 2, 0]} castShadow>
        <boxGeometry args={[6, 4, 4]} />
        <meshStandardMaterial color={0xf5f5dc} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 4.2, 0]} castShadow>
        <boxGeometry args={[6.5, 0.3, 4.5]} />
        <meshStandardMaterial color={0x8b4513} />
      </mesh>
      
      {/* Door */}
      <mesh position={[0, 1, 2.1]}>
        <boxGeometry args={[1.5, 2.4, 0.1]} />
        <meshStandardMaterial color={0x4a3728} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[-1.5, 2.5, 2.05]}>
        <boxGeometry args={[1.2, 1.5, 0.1]} />
        <meshStandardMaterial color={0x87ceeb} transparent opacity={0.7} />
      </mesh>
      <mesh position={[1.5, 2.5, 2.05]}>
        <boxGeometry args={[1.2, 1.5, 0.1]} />
        <meshStandardMaterial color={0x87ceeb} transparent opacity={0.7} />
      </mesh>

      {/* Interaction indicator */}
      {isActive && (
        <mesh position={[0, 5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.5, 4, 32]} />
          <meshBasicMaterial color={0x00ff00} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default CoastalOffice;
