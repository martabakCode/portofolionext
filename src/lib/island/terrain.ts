/**
 * Procedural Island Terrain Generator
 * Menggunakan Simplex Noise untuk generate terrain
 */

import { createNoise2D } from 'simplex-noise';

export interface TerrainConfig {
  seed?: number;
  width: number;
  depth: number;
  maxHeight: number;
  waterLevel: number;
  noiseScale: number;
  islandRadius: number;
}

export interface VoxelData {
  x: number;
  y: number;
  z: number;
  type: 'sand' | 'grass' | 'stone' | 'dirt' | 'water';
}

export interface TerrainData {
  voxels: VoxelData[];
  heightMap: number[][];
  maxHeight: number;
  minHeight: number;
}

const defaultConfig: Partial<TerrainConfig> = {
  width: 64,
  depth: 64,
  maxHeight: 12,
  waterLevel: 2,
  noiseScale: 0.05,
  islandRadius: 25,
};

/**
 * Generate procedural island terrain
 */
export function generateTerrain(config: Partial<TerrainConfig> = {}): TerrainData {
  const finalConfig = { ...defaultConfig, ...config } as TerrainConfig;
  const noise2D = createNoise2D();
  
  const { width, depth, maxHeight, waterLevel, noiseScale, islandRadius } = finalConfig;
  
  const voxels: VoxelData[] = [];
  const heightMap: number[][] = [];
  
  const centerX = width / 2;
  const centerZ = depth / 2;
  
  let maxFoundHeight = -Infinity;
  let minFoundHeight = Infinity;
  
  // Generate height map
  for (let x = 0; x < width; x++) {
    heightMap[x] = [];
    for (let z = 0; z < depth; z++) {
      // Distance from center
      const dx = x - centerX;
      const dz = z - centerZ;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // Island falloff - create circular island shape
      const normalizedDistance = distance / islandRadius;
      const falloff = Math.max(0, 1 - Math.pow(normalizedDistance, 2));
      
      // Multi-octave noise for detail
      let noise = 0;
      let amplitude = 1;
      let frequency = noiseScale;
      
      for (let i = 0; i < 4; i++) {
        noise += noise2D(x * frequency, z * frequency) * amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }
      
      // Normalize noise to 0-1 range
      noise = (noise + 1) / 2;
      
      // Apply falloff and calculate height
      let height = Math.floor(noise * maxHeight * falloff);
      
      // Ensure minimum height above water
      if (height < 1 && falloff > 0.1) {
        height = 1;
      }
      
      heightMap[x][z] = height;
      
      if (height > maxFoundHeight) maxFoundHeight = height;
      if (height < minFoundHeight) minFoundHeight = height;
      
      // Generate voxels for this column
      if (height > 0) {
        for (let y = 0; y <= height; y++) {
          let type: VoxelData['type'];
          
          if (y === height) {
            // Top layer
            if (y <= waterLevel + 1) {
              type = 'sand';
            } else if (y >= maxHeight * 0.7) {
              type = 'stone';
            } else {
              type = 'grass';
            }
          } else if (y >= height - 2 && y > waterLevel + 2) {
            // Dirt layer below grass
            type = 'dirt';
          } else {
            // Stone deep underground
            type = 'stone';
          }
          
          voxels.push({ x, y, z, type });
        }
      }
      
      // Fill water up to water level
      if (height < waterLevel) {
        for (let y = height + 1; y <= waterLevel; y++) {
          voxels.push({ x, y, z, type: 'water' });
        }
      }
    }
  }
  
  return {
    voxels,
    heightMap,
    maxHeight: maxFoundHeight,
    minHeight: minFoundHeight,
  };
}

/**
 * Get biome at specific position
 */
export function getBiome(height: number, waterLevel: number, maxHeight: number): 'beach' | 'plains' | 'mountain' {
  if (height <= waterLevel + 2) return 'beach';
  if (height >= maxHeight * 0.65) return 'mountain';
  return 'plains';
}

/**
 * Find valid tree positions
 */
export function findTreePositions(heightMap: number[][], waterLevel: number, maxHeight: number, count: number): { x: number; z: number; y: number }[] {
  const positions: { x: number; z: number; y: number }[] = [];
  const width = heightMap.length;
  const depth = heightMap[0]?.length || 0;
  
  const attempts = count * 10;
  let placed = 0;
  
  for (let i = 0; i < attempts && placed < count; i++) {
    const x = Math.floor(Math.random() * (width - 4)) + 2;
    const z = Math.floor(Math.random() * (depth - 4)) + 2;
    const height = heightMap[x][z];
    
    const biome = getBiome(height, waterLevel, maxHeight);
    
    // Only place trees in plains biome
    if (biome === 'plains' && height > waterLevel) {
      // Check if position is clear (no nearby trees)
      const tooClose = positions.some(pos => {
        const dx = pos.x - x;
        const dz = pos.z - z;
        return Math.sqrt(dx * dx + dz * dz) < 4;
      });
      
      if (!tooClose) {
        positions.push({ x, z, y: height + 1 });
        placed++;
      }
    }
  }
  
  return positions;
}
