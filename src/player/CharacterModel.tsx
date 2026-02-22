import { useRef, useMemo } from 'react';
import { Mesh, Group, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/useGameStore';
import { PlayerState } from '@/types/game';

const CharacterModel: React.FC = () => {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Mesh>(null);
  const rightArmRef = useRef<Mesh>(null);
  const leftLegRef = useRef<Mesh>(null);
  const rightLegRef = useRef<Mesh>(null);

  const playerState = useGameStore((state) => state.currentState);

  // Materials
  const materials = useMemo(() => ({
    skin: { color: "#ffdbac", roughness: 0.5 },
    shirt: { color: "#3b82f6", roughness: 0.7 },
    pants: { color: "#1e3a5f", roughness: 0.8 },
  }), []);

  // Animation loop
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Default positions
    const bodyBaseY = 0.75; // Body center (height 0.7) -> Bottom at 0.4. Legs 0.7. 
    // Let's align feet to 0.
    // Leg height 0.7. Center at 0.35.
    // Body height 0.7. Center at 0.7 + 0.35 = 1.05?

    // Adjust Layout
    // Legs: length 0.75. Center Y = 0.375.
    // Body: length 0.75. Bottom at 0.75. Center Y = 0.75 + 0.375 = 1.125.
    // Head: size 0.4. Bottom at 1.5. Center Y = 1.7.

    // Reset rotations
    if (leftArmRef.current) { leftArmRef.current.rotation.x = 0; leftArmRef.current.rotation.z = 0; }
    if (rightArmRef.current) { rightArmRef.current.rotation.x = 0; rightArmRef.current.rotation.z = 0; }
    if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
    if (rightLegRef.current) rightLegRef.current.rotation.x = 0;

    switch (playerState) {
      case PlayerState.IDLE:
      case PlayerState.INTERACT: // Fallback if interact has no anim yet or combine
        // Breathing
        if (bodyRef.current) bodyRef.current.position.y = 1.1 + Math.sin(time * 2) * 0.02;
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0.1 + Math.sin(time * 1.5) * 0.05;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -0.1 - Math.sin(time * 1.5) * 0.05;
        // Interaction specific arm raise
        if (playerState === PlayerState.INTERACT && rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI / 2;
        }
        break;

      case PlayerState.WALK:
        const walkSpeed = 10;
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time * walkSpeed) * 0.6;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time * walkSpeed + Math.PI) * 0.6;
        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * walkSpeed + Math.PI) * 0.6;
        if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time * walkSpeed) * 0.6;
        if (bodyRef.current) bodyRef.current.position.y = 1.1 + Math.abs(Math.sin(time * walkSpeed)) * 0.05;
        break;

      case PlayerState.RUN:
        const runSpeed = 15;
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time * runSpeed) * 1.0;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time * runSpeed + Math.PI) * 1.0;
        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * runSpeed + Math.PI) * 1.0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time * runSpeed) * 1.0;
        if (bodyRef.current) bodyRef.current.position.y = 1.1 + Math.abs(Math.sin(time * runSpeed)) * 0.08;
        break;

      case PlayerState.JUMP: // Now valid
        if (leftArmRef.current) leftArmRef.current.rotation.z = 2.5;
        if (rightArmRef.current) rightArmRef.current.rotation.z = -2.5;
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0.5;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0.2;
        break;
    }
  });

  return (
    <group ref={groupRef} name="character_model">
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.5, 0.75, 0.3]} />
        <meshStandardMaterial color={materials.shirt.color} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={materials.skin.color} />
        {/* Face */}
        <group position={[0, 0, 0.21]}>
          {/* Eyes */}
          <mesh position={[-0.1, 0.05, 0]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color="black" />
          </mesh>
          <mesh position={[0.1, 0.05, 0]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color="black" />
          </mesh>
        </group>
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.4, 1.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color={materials.skin.color} />
        <mesh position={[0, 0.25, 0]}> {/* Shirt Sleeve */}
          <boxGeometry args={[0.21, 0.25, 0.21]} />
          <meshStandardMaterial color={materials.shirt.color} />
        </mesh>
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.4, 1.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.7, 0.2]} />
        <meshStandardMaterial color={materials.skin.color} />
        <mesh position={[0, 0.25, 0]}> {/* Shirt Sleeve */}
          <boxGeometry args={[0.21, 0.25, 0.21]} />
          <meshStandardMaterial color={materials.shirt.color} />
        </mesh>
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.15, 0.375, 0]} castShadow>
        <boxGeometry args={[0.22, 0.75, 0.22]} />
        <meshStandardMaterial color={materials.pants.color} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.15, 0.375, 0]} castShadow>
        <boxGeometry args={[0.22, 0.75, 0.22]} />
        <meshStandardMaterial color={materials.pants.color} />
      </mesh>
    </group>
  );
};

export default CharacterModel;
