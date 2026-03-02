'use client';

import { useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, PerspectiveCamera, Html, useProgress, useGLTF } from '@react-three/drei';
import { Group, Vector3, MathUtils, Box3, Color } from 'three';
import { Terrain } from './three/island/Terrain';
import { Trees } from './three/island/Trees';
import { Water } from './three/island/Water';
import { Clouds } from './three/island/Clouds';
import { Lighting } from './three/island/Lighting';
import { generateTerrain, TerrainConfig } from '@/lib/island/terrain';

// ============================================================
// AVATAR THAT FOLLOWS MOUSE
// ============================================================
function AvatarWithMouseFollow({ terrainHeight }: { terrainHeight: number }) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/avatar.glb');
  const { viewport } = useThree();
  
  // Mouse position normalized (-1 to 1)
  const mousePos = useRef({ x: 0, y: 0 });
  
  // Track mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Prepare model
  const avatarModel = useMemo(() => {
    if (!scene) return null;
    
    const clone = scene.clone();
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    
    // Center at feet
    clone.position.set(-center.x, -box.min.y, -center.z);
    
    // Make visible with nice colors
    clone.traverse((child) => {
      if ((child as any).isMesh) {
        (child as any).visible = true;
        (child as any).castShadow = true;
        (child as any).receiveShadow = true;
        
        if ((child as any).material) {
          const mat = (child as any).material.clone();
          mat.color = new Color(1, 0.8, 0.6); // Skin tone
          mat.emissive = new Color(0.1, 0.05, 0);
          mat.emissiveIntensity = 0.2;
          (child as any).material = mat;
        }
      }
    });
    
    return { mesh: clone, size };
  }, [scene]);
  
  // Animation - follow mouse
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const dt = Math.min(delta, 0.1);
    
    // Calculate target rotation based on mouse X
    // Mouse left (-1) -> rotate left, Mouse right (1) -> rotate right
    const targetRot = mousePos.current.x * Math.PI * 0.8; // Limit rotation range
    
    // Smooth rotation
    const currentRot = groupRef.current.rotation.y;
    let diff = targetRot - currentRot;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    groupRef.current.rotation.y += diff * 3 * dt;
    
    // Subtle idle animation (breathing)
    const time = state.clock.elapsedTime;
    groupRef.current.position.y = terrainHeight + 0.8 + Math.sin(time * 2) * 0.05;
  });
  
  const scale = avatarModel ? Math.max(0.5, 1.5 / avatarModel.size.y) : 1;
  
  return (
    <group ref={groupRef} position={[0, terrainHeight + 0.8, 0]} scale={scale}>
      {avatarModel ? (
        <primitive object={avatarModel.mesh} />
      ) : (
        <mesh>
          <capsuleGeometry args={[0.5, 1.5, 4, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
      )}
      
      {/* Shadow */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial color="black" opacity={0.3} transparent />
      </mesh>
      
      {/* Interaction hint */}
      <Html distanceFactor={15} center>
        <div className="text-xs text-white/70 bg-black/40 px-2 py-1 rounded -mt-24 whitespace-nowrap pointer-events-none">
          👋 Move your mouse!
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload('/avatar.glb');

// ============================================================
// AUTO-ROTATING CAMERA
// ============================================================
function AutoCamera() {
  const { camera } = useThree();
  const angle = useRef(0);
  
  useFrame((state, delta) => {
    // Slow orbit around center
    angle.current += delta * 0.1;
    
    const radius = 25;
    const height = 15;
    
    camera.position.x = Math.sin(angle.current) * radius;
    camera.position.z = Math.cos(angle.current) * radius;
    camera.position.y = height;
    
    camera.lookAt(0, 3, 0);
  });
  
  return null;
}

// ============================================================
// LOADING
// ============================================================
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-center pointer-events-none bg-black/60 p-6 rounded-xl">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white font-medium">Loading 3D Scene...</p>
        <p className="text-slate-400 text-sm">{Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

// ============================================================
// MAIN SHOWCASE
// ============================================================
export function GameExperience() {
  const config = useMemo<Partial<TerrainConfig>>(() => ({
    width: 64,
    depth: 64,
    maxHeight: 12,
    waterLevel: 2.5,
    noiseScale: 0.05,
    islandRadius: 26,
  }), []);

  const terrainData = useMemo(() => generateTerrain(config), [config]);

  const centerX = 32;
  const centerZ = 32;
  
  // Get terrain height at center
  const centerTerrainHeight = terrainData.heightMap[32]?.[32] || 5;

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-sky-300 to-sky-100">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[25, 15, 25]} fov={55} near={0.1} far={500} />
        <AutoCamera />

        {/* Sky */}
        <Sky
          distance={450000}
          sunPosition={[100, 80, 50]}
          inclination={0.48}
          azimuth={0.25}
        />

        {/* Lighting */}
        <Lighting timeOfDay="day" />
        <ambientLight intensity={0.6} />

        <Suspense fallback={<Loader />}>
          {/* Island World - centered */}
          <group position={[-centerX, 0, -centerZ]}>
            <Terrain config={config} seed={12345} />
            
            <Trees
              heightMap={terrainData.heightMap}
              waterLevel={config.waterLevel || 2.5}
              maxHeight={terrainData.maxHeight}
              count={40}
            />
            
            <Water
              width={config.width}
              depth={config.depth}
              waterLevel={config.waterLevel}
            />
            
            <Clouds
              count={8}
              area={config.width || 64}
              height={config.maxHeight || 12}
            />

            {/* Avatar at center of island */}
            <group position={[centerX, 0, centerZ]}>
              <AvatarWithMouseFollow terrainHeight={centerTerrainHeight} />
            </group>
          </group>
        </Suspense>

        <fog attach="fog" args={[0xa8d5e5, 40, 150]} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md rounded-xl px-5 py-4 text-white">
        <h1 className="font-bold text-xl mb-1">🏝️ My 3D Island</h1>
        <p className="text-sm text-white/70">Move your mouse to interact with my avatar!</p>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
        <div className="bg-black/50 backdrop-blur rounded-lg px-4 py-2 text-white text-sm">
          👆 Move mouse to rotate avatar
        </div>
        <div className="bg-black/50 backdrop-blur rounded-lg px-4 py-2 text-white/70 text-sm">
          Built with Three.js & React
        </div>
      </div>
    </div>
  );
}
