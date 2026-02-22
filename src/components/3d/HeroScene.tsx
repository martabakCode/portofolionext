"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text, ContactShadows, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function RotatingLegoBlock() {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    return (
        <group ref={meshRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                {/* Main Brick Body */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[3, 3, 3]} />
                    <meshStandardMaterial color="#4f46e5" roughness={0.2} metalness={0.1} />
                </mesh>

                {/* Studs on top (2x2) */}
                {[[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]].map(([x, z], i) => (
                    <mesh key={i} position={[x, 1.6, z]} castShadow>
                        <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
                        <meshStandardMaterial color="#4f46e5" roughness={0.2} metalness={0.1} />
                        {/* Lego Logo Text on Studs */}
                        <Text
                            position={[0, 0.11, 0]}
                            rotation={[-Math.PI / 2, 0, 0]}
                            fontSize={0.2}
                            color="#312e81"
                            font="/fonts/Inter-Bold.ttf" // Use default if font not found
                        >
                            LEGO
                        </Text>
                    </mesh>
                ))}
            </Float>
        </group>
    );
}

export default function HeroScene() {
    return (
        <div className="w-full h-full min-h-[400px]">
            <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
                <pointLight position={[-5, 5, -5]} color="blue" intensity={1} />

                <RotatingLegoBlock />

                <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2.5} far={4.5} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
            </Canvas>
        </div>
    );
}
