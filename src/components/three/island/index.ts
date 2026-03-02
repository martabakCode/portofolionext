// Export all island components
export { IslandScene } from './IslandScene';
export { PlayableIslandScene } from './PlayableIslandScene';
export { ThirdPersonIsland } from './ThirdPersonIsland';
export { Terrain } from './Terrain';
export { Trees } from './Trees';
export { Water } from './Water';
export { Clouds } from './Clouds';
export { Lighting } from './Lighting';
export { CameraController } from './CameraController';

// Export shared components
export { Loading, ErrorFallback } from '../shared/Loading';

// Export utilities
export { generateTerrain, findTreePositions, getBiome } from '@/lib/island/terrain';
export { getVoxelColor, getBaseColor, VOXEL_COLORS } from '@/lib/island/colors';
export type { TerrainConfig, VoxelData, TerrainData } from '@/lib/island/terrain';
export type { VoxelType } from '@/lib/island/colors';
