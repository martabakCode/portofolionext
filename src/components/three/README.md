# Voxel Island Generator

Procedural voxel-based island generator built with Three.js, React Three Fiber, and Next.js.

Inspired by [Island Fever](https://github.com/kylepaulsen/Island-Fever) by Kyle Paulsen.

## Features

- **Procedural Generation**: Each island is uniquely generated using Simplex Noise
- **Voxel-based Terrain**: Efficient rendering with InstancedMesh (supports thousands of voxels)
- **Dynamic Lighting**: Day, sunset, and night modes with realistic lighting
- **Animated Water**: Custom shader effects with wave animations
- **Vegetation**: Procedurally placed trees with trunks and leaves
- **Interactive Camera**: OrbitControls for rotate, pan, and zoom
- **Clouds**: Floating voxel clouds for atmosphere
- **3D Avatar**: GLB model loader with animations and environment
- **Playable Character**: WASD/Arrow key movement with terrain following

## Directory Structure

```
src/components/three/
├── island/
│   ├── IslandScene.tsx      # Main scene component
│   ├── Terrain.tsx          # Voxel terrain renderer
│   ├── Trees.tsx            # Procedural tree generator
│   ├── Water.tsx            # Animated water shader
│   ├── Clouds.tsx           # Floating voxel clouds
│   ├── Lighting.tsx         # Dynamic lighting setup
│   ├── CameraController.tsx # OrbitControls wrapper
│   └── index.ts             # Exports
├── avatar/
│   ├── AvatarScene.tsx      # Complete avatar scene
│   ├── AvatarModel.tsx      # GLB model loader
│   └── index.ts             # Exports
├── shared/
│   └── Loading.tsx          # Loading & error states

src/lib/island/
├── terrain.ts               # Procedural terrain generation
└── colors.ts                # Voxel color palettes

src/app/island/
├── page.tsx                 # Island page (metadata)
├── IslandClient.tsx         # Client-side wrapper
└── play/
    └── page.tsx             # Playable character demo
```

## Usage

### Island Scene

```tsx
import { IslandScene } from '@/components/three/island';

export default function MyPage() {
  return (
    <IslandScene
      seed={Math.random()}          // Random seed for generation
      timeOfDay="day"               // 'day' | 'sunset' | 'night'
      treeCount={50}                // Number of trees
      showClouds={true}             // Show clouds
      config={{
        width: 64,                  // Island width
        depth: 64,                  // Island depth
        maxHeight: 16,              // Maximum terrain height
        waterLevel: 3,              // Water surface level
        noiseScale: 0.045,          // Terrain detail level
        islandRadius: 26,           // Island size
      }}
    />
  );
}
```

### Avatar Scene

```tsx
import { AvatarScene } from '@/components/three/avatar';

export default function MyPage() {
  return (
    <AvatarScene
      url="/avatar.glb"             // Path to GLB file
      scale={1}                     // Model scale
      autoRotate={false}            // Auto-rotate model
      floatAnimation={true}         // Floating idle animation
      controls={true}               // Enable orbit controls
      environment="city"            // Environment preset
    />
  );
}
```

### Avatar Model (for custom scenes)

```tsx
import { AvatarModel } from '@/components/three/avatar';

export default function CustomScene() {
  return (
    <Canvas>
      <AvatarModel 
        url="/avatar.glb"
        scale={1}
        position={[0, 0, 0]}
        autoRotate={false}
        floatAnimation={true}
      />
    </Canvas>
  );
}
```

### Playable Island

```tsx
import { PlayableIslandScene } from '@/components/three/island';

export default function GamePage() {
  return (
    <PlayableIslandScene
      seed={12345}
      timeOfDay="day"
      treeCount={30}
      playerSpeed={6}           // Character movement speed
      config={{
        width: 64,
        depth: 64,
        maxHeight: 14,
        waterLevel: 3,
        noiseScale: 0.045,
        islandRadius: 26,
      }}
    />
  );
}
```

### Character Controls

- **WASD** or **Arrow Keys** - Move character
- Character automatically follows terrain height (walks up/down hills)
- Camera follows the character
- Character rotates to face movement direction

### CharacterController (Standalone)

```tsx
import { CharacterController } from '@/components/three/avatar';

<CharacterController
  url="/avatar.glb"
  scale={0.8}
  speed={5}
  bounds={[-30, 30, -30, 30]}     // Movement boundaries
  startPosition={[0, 5, 0]}
  getTerrainHeight={(x, z) => 0}  // Function to get terrain height at position
  onPositionChange={(pos) => {}}  // Callback when position changes
/>
```

## Avatar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | `'/avatar.glb'` | Path to GLB file |
| `scale` | `number` | `1` | Model scale |
| `position` | `[x, y, z]` | `[0, 0, 0]` | Model position |
| `rotation` | `[x, y, z]` | `[0, 0, 0]` | Model rotation (radians) |
| `autoRotate` | `boolean` | `false` | Auto-rotate the model |
| `floatAnimation` | `boolean` | `true` | Floating idle animation |
| `animationName` | `string` | - | Specific animation to play |

## Controls

- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan camera
- **Scroll**: Zoom in/out

## Tech Stack

- [Three.js](https://threejs.org/) - 3D library
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [@react-three/drei](https://docs.pmnd.rs/react-three-drei) - Useful helpers for R3F
- [simplex-noise](https://github.com/josephg/noisejs) - Noise generation

## Performance

- Uses `InstancedMesh` for efficient rendering of thousands of voxels
- Dynamic imports with SSR disabled for Three.js components
- Optimized geometry and materials
- LOD (Level of Detail) ready architecture
- GLB models use `useGLTF.preload()` for faster loading
