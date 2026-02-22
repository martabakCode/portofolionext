'use client';

import { useRef, useLayoutEffect, useMemo } from 'react';
import { Mesh, PlaneGeometry, Vector3, Float32BufferAttribute } from 'three';
import * as THREE from 'three';
import { TerrainSystem, TERRAIN_CONFIG } from '@/core/systems/TerrainSystem';

interface TerrainProps {
  size?: number;
}

// Custom shader for height-based color blending
const terrainVertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDistanceFromCenter;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    // Calculate distance from center for coastal effects
    vDistanceFromCenter = length(position.xz);
    
    // Pass elevation for fragment shader
    vElevation = position.y;
    
    // Calculate normal
    vNormal = normalize(normalMatrix * normal);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const terrainFragmentShader = `
  uniform float uWaterLevel;
  uniform float uSandLevel;
  uniform float uGrassLevel;
  uniform float uRockLevel;
  uniform float uSnowLevel;
  uniform vec3 uColorDeepWater;
  uniform vec3 uColorShallowWater;
  uniform vec3 uColorSand;
  uniform vec3 uColorGrass;
  uniform vec3 uColorForest;
  uniform vec3 uColorRock;
  uniform vec3 uColorSnow;
  uniform float uTime;
  
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDistanceFromCenter;
  
  // Smooth color blending function
  vec3 blendColor(vec3 color1, vec3 color2, float factor) {
    return mix(color1, color2, smoothstep(0.0, 1.0, factor));
  }
  
  void main() {
    vec3 finalColor;
    
    // Calculate slope for rock detection
    float slope = 1.0 - dot(vNormal, vec3(0.0, 1.0, 0.0));
    
    // Height-based color selection with smooth transitions
    if (vElevation < uWaterLevel - 2.0) {
      // Deep ocean
      finalColor = uColorDeepWater;
    } else if (vElevation < uWaterLevel) {
      // Shallow water to deep water transition
      float t = smoothstep(uWaterLevel - 2.0, uWaterLevel, vElevation);
      finalColor = blendColor(uColorDeepWater, uColorShallowWater, t);
    } else if (vElevation < uSandLevel) {
      // Water to sand (beach)
      float t = smoothstep(uWaterLevel, uSandLevel, vElevation);
      // Add some noise-like variation to sand
      float sandNoise = sin(vPosition.x * 20.0) * sin(vPosition.z * 20.0) * 0.05;
      vec3 sandColor = uColorSand + vec3(sandNoise);
      finalColor = blendColor(uColorShallowWater, sandColor, t);
    } else if (vElevation < uGrassLevel) {
      // Sand to grass
      float t = smoothstep(uSandLevel, uGrassLevel, vElevation);
      finalColor = blendColor(uColorSand, uColorGrass, t);
    } else if (vElevation < uRockLevel) {
      // Grass to forest/rock
      float t = smoothstep(uGrassLevel, uRockLevel, vElevation);
      
      // Use slope to determine rock vs forest
      vec3 grassForestMix = mix(uColorGrass, uColorForest, smoothstep(0.3, 0.6, slope));
      finalColor = blendColor(grassForestMix, uColorRock, t);
    } else if (vElevation < uSnowLevel) {
      // Rock to snow
      float t = smoothstep(uRockLevel, uSnowLevel, vElevation);
      finalColor = blendColor(uColorRock, uColorSnow, t);
    } else {
      // Snow caps
      finalColor = uColorSnow;
    }
    
    // Add coastal foam effect near water line
    float waterEdge = smoothstep(uWaterLevel - 0.5, uWaterLevel + 0.3, vElevation);
    float foam = 1.0 - waterEdge;
    foam *= smoothstep(0.0, 1.0, sin(vPosition.x * 10.0 + uTime) * sin(vPosition.z * 10.0 + uTime * 0.8) * 0.5 + 0.5);
    finalColor = mix(finalColor, vec3(1.0), foam * 0.3);
    
    // Add simple lighting
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 ambient = vec3(0.3);
    vec3 lighting = ambient + vec3(0.7) * diff;
    
    finalColor *= lighting;
    
    // Fog effect based on distance
    float fogFactor = smoothstep(50.0, 150.0, vDistanceFromCenter);
    vec3 fogColor = vec3(0.73, 0.90, 0.99); // Light sky blue
    finalColor = mix(finalColor, fogColor, fogFactor * 0.6);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const Terrain: React.FC<TerrainProps> = ({ size = 200 }) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { waterLevel } = TERRAIN_CONFIG;

  // Generate geometry with proper height data
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(size, size, 256, 256);
    const positionAttribute = geo.attributes.position;
    const colors: number[] = [];
    const vertex = new Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);

      const x = vertex.x;
      const z = vertex.y; // In PlaneGeometry, y is z in world space

      const height = TerrainSystem.getHeightAt(x, z);
      positionAttribute.setZ(i, height);

      // Get color based on region
      const region = TerrainSystem.getRegionAt(x, z);
      const color = TerrainSystem.getRegionColor(region);
      colors.push(color[0], color[1], color[2]);
    }

    positionAttribute.needsUpdate = true;
    geo.computeVertexNormals();
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));

    return geo;
  }, [size]);

  // Shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uWaterLevel: { value: waterLevel },
    uSandLevel: { value: waterLevel + 1.5 },
    uGrassLevel: { value: 3.0 },
    uRockLevel: { value: 12.0 },
    uSnowLevel: { value: 20.0 },
    uColorDeepWater: { value: new Vector3(0.05, 0.15, 0.35) },
    uColorShallowWater: { value: new Vector3(0.15, 0.45, 0.65) },
    uColorSand: { value: new Vector3(0.85, 0.78, 0.55) },
    uColorGrass: { value: new Vector3(0.35, 0.65, 0.25) },
    uColorForest: { value: new Vector3(0.20, 0.45, 0.15) },
    uColorRock: { value: new Vector3(0.45, 0.42, 0.38) },
    uColorSnow: { value: new Vector3(0.95, 0.95, 0.98) },
  }), [waterLevel]);

  // Animate uniforms
  useLayoutEffect(() => {
    if (!materialRef.current) return;
    
    let animationId: number;
    const animate = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += 0.01;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <group>
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        name="terrain"
        geometry={geometry}
      >
        <shaderMaterial
          ref={materialRef}
          vertexShader={terrainVertexShader}
          fragmentShader={terrainFragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* Collision Boundary (Invisible Ring) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[size * 0.48, size * 0.5, 64]} />
        <meshBasicMaterial color="red" />
      </mesh>

      <CliffRocks />
    </group>
  );
};

// Rocks around the cliff edge
const CliffRocks = () => {
  const rocks = useMemo(() => {
    const items = [];
    const count = 40;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.2);
      const radius = 72 + (Math.random() - 0.5) * 5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const y = TerrainSystem.getHeightAt(x, z);

      const scale = 2 + Math.random() * 3;

      items.push({
        position: [x, y, z] as [number, number, number],
        scale: [scale, scale, scale] as [number, number, number],
        rotation: [Math.random(), Math.random(), Math.random()] as [number, number, number]
      });
    }
    return items;
  }, []);

  return (
    <group>
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          position={rock.position}
          rotation={rock.rotation}
          scale={rock.scale}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#57534e" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

export default Terrain;
