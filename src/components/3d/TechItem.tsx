import { useRef, useState } from "react";
import { Text, Html, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { TechStack } from "@/modules/techstack/techstack.types";

interface TechItemProps {
    tech: TechStack;
    position: [number, number, number];
}

export default function TechItem({ tech, position }: TechItemProps) {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Group>(null);

    // Smooth hover animation
    useFrame((state, delta) => {
        if (meshRef.current) {
            // Rotate slowly
            meshRef.current.rotation.y += delta * 0.5;

            // Hover scale effect
            const targetScale = hovered ? 1.2 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
        }
    });

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <group
                    ref={meshRef}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                >
                    {/* Tech Crystal / Block */}
                    <mesh castShadow>
                        <octahedronGeometry args={[0.8, 0]} />
                        <meshPhysicalMaterial
                            color={tech.color || "#4f46e5"}
                            metalness={0.2}
                            roughness={0.1}
                            transmission={0.6} // Glass-like
                            thickness={1}
                            clearcoat={1}
                        />
                    </mesh>

                    {/* Inner Core (Glowing) */}
                    <mesh>
                        <octahedronGeometry args={[0.4, 0]} />
                        <meshBasicMaterial color={tech.color || "#4f46e5"} toneMapped={false} />
                    </mesh>

                    {/* Text Label */}
                    <group position={[0, -1.2, 0]}>
                        <Text
                            fontSize={0.25}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                            outlineWidth={0.02}
                            outlineColor="#000000"
                        >
                            {tech.name}
                        </Text>
                        <Text
                            position={[0, -0.25, 0]}
                            fontSize={0.15}
                            color="#a1a1aa"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {tech.category}
                        </Text>
                    </group>

                    {/* Hover Info */}
                    {hovered && (
                        <Html position={[0, 1.2, 0]} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
                            <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap">
                                <span className="text-white text-xs font-bold" style={{ color: tech.color }}>
                                    {tech.name}
                                </span>
                            </div>
                        </Html>
                    )}
                </group>
            </Float>

            {/* Ground Base Projector */}
            <mesh position={[0, -position[1] + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.4, 32]} />
                <meshBasicMaterial color={tech.color || "#4f46e5"} opacity={0.5} transparent />
            </mesh>
            {/* Beam */}
            <mesh position={[0, -position[1] / 2, 0]}>
                <cylinderGeometry args={[0.02, 0.02, position[1], 8]} />
                <meshBasicMaterial color={tech.color || "#4f46e5"} opacity={0.2} transparent />
            </mesh>
        </group>
    );
}
