/**
 * TerrainSystem - Procedural Terrain Generation
 * 
 * Features:
 * - Multi-layer Perlin noise (octaves)
 * - Smooth coastal falloff using smoothstep
 * - Ridged multifractal for mountains
 * - Height-based region detection
 */

import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { Vector3 } from 'three';

// Configuration for consistent generation
export const TERRAIN_CONFIG = {
  size: 200,
  resolution: 256,
  maxHeight: 30,
  cliffRadius: 65,
  oceanRadius: 90,
  waterLevel: -2,
  octaves: 6,
  persistence: 0.5,
  lacunarity: 2.0,
  noiseScale: 0.012,
  mountainHeight: 1.8,
};

// Smooth step function for smooth transitions
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

// Smoother step (Ken Perlin's improved version)
function smootherstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

// Linear interpolation
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class TerrainSystem {
  private static noise2D: NoiseFunction2D;
  private static initialized = false;
  private static seed = 12345;

  static initialize(seed: number = 12345): void {
    if (this.initialized) return;
    this.seed = seed;
    this.noise2D = createNoise2D(() => this.seed);
    this.initialized = true;
  }

  /**
   * Calculate height at a specific (x, z) coordinate
   * Uses multi-layer Perlin noise with coastal falloff
   */
  static getHeightAt(x: number, z: number): number {
    if (!this.initialized) {
      this.initialize();
    }

    const {
      maxHeight,
      cliffRadius,
      oceanRadius,
      waterLevel,
      octaves,
      persistence,
      lacunarity,
      noiseScale,
      mountainHeight,
    } = TERRAIN_CONFIG;

    // Distance from center
    const dist = Math.sqrt(x * x + z * z);

    // === MULTI-LAYER NOISE GENERATION ===
    // Base terrain shape using fBm (fractal Brownian motion)
    let baseHeight = 0;
    let frequency = noiseScale;
    let amplitude = 1;
    let maxAmplitude = 0;

    for (let i = 0; i < octaves; i++) {
      baseHeight += this.noise2D(x * frequency, z * frequency) * amplitude;
      maxAmplitude += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    // Normalize
    baseHeight /= maxAmplitude;

    // Add ridged noise for mountain detail
    let ridgeNoise = 0;
    let ridgeFreq = noiseScale * 2;
    let ridgeAmp = 0.3;
    let ridgeMaxAmp = 0;
    for (let i = 0; i < 3; i++) {
      const n = this.noise2D(x * ridgeFreq, z * ridgeFreq);
      ridgeNoise += (1 - Math.abs(n)) * ridgeAmp;
      ridgeMaxAmp += ridgeAmp;
      ridgeAmp *= 0.5;
      ridgeFreq *= 2;
    }
    ridgeNoise /= ridgeMaxAmp;

    // Add turbulence for smaller details
    let detailNoise = 0;
    let detailFreq = noiseScale * 4;
    let detailAmp = 0.15;
    for (let i = 0; i < 2; i++) {
      detailNoise += Math.abs(this.noise2D(x * detailFreq, z * detailFreq)) * detailAmp;
      detailAmp *= 0.5;
      detailFreq *= 2;
    }

    // Combine noises
    let height = baseHeight + ridgeNoise * 0.3 + detailNoise;

    // === COASTAL FALLOFF ===
    // Create island shape using smoothstep falloff
    const innerEdge = cliffRadius * 0.3;
    
    if (dist > innerEdge) {
      // Calculate falloff factor (1 = full height, 0 = ocean)
      let falloff: number;
      
      if (dist < cliffRadius) {
        // Smooth transition from land to cliff
        falloff = smoothstep(innerEdge, cliffRadius, dist);
        // Apply easing for more natural slope
        falloff = smootherstep(innerEdge, cliffRadius, dist);
      } else if (dist < oceanRadius) {
        // Cliff to beach transition
        falloff = 1 - smoothstep(cliffRadius, oceanRadius, dist);
        falloff = falloff * 0.3; // Lower height near beach
      } else {
        // Beyond ocean radius - deep water
        falloff = 0;
      }
      
      // Apply falloff with some noise variation at edges
      const edgeNoise = this.noise2D(x * 0.05, z * 0.05) * 0.1;
      height = lerp(height, -5, (1 - falloff) + edgeNoise);
    }
    
    // Boost center height for mountains
    const centerBoost = Math.max(0, 1 - dist / (cliffRadius * 0.8));
    height += centerBoost * centerBoost * maxHeight * 0.5 * mountainHeight;
    
    // Add specific mountain peaks
    const peak1X = 0, peak1Z = -30;
    const peak1Dist = Math.sqrt((x - peak1X) ** 2 + (z - peak1Z) ** 2);
    if (peak1Dist < 25) {
      const peakHeight = (1 - peak1Dist / 25) ** 2 * 30 * mountainHeight;
      height = Math.max(height, peakHeight - 5);
    }
    
    const peak2X = 20, peak2Z = 10;
    const peak2Dist = Math.sqrt((x - peak2X) ** 2 + (z - peak2Z) ** 2);
    if (peak2Dist < 20) {
      const peakHeight = (1 - peak2Dist / 20) ** 2 * 20 * mountainHeight;
      height = Math.max(height, peakHeight - 3);
    }

    // Final height scaling
    height = height * maxHeight * 0.5;
    
    // Ensure ocean floor drops below water level
    if (dist > oceanRadius) {
      const deepFactor = smoothstep(oceanRadius, oceanRadius + 20, dist);
      height = lerp(height, -15, deepFactor);
    }

    // Clamp very far distance
    if (dist > TERRAIN_CONFIG.size / 2) height = -20;

    return height;
  }

  /**
   * Get surface normal at position (approximated)
   * Used for slope detection
   */
  static getNormalAt(x: number, z: number): Vector3 {
    const step = 0.5;
    const hL = this.getHeightAt(x - step, z);
    const hR = this.getHeightAt(x + step, z);
    const hD = this.getHeightAt(x, z - step);
    const hU = this.getHeightAt(x, z + step);

    const normal = new Vector3(hL - hR, 2.0 * step, hD - hU);
    normal.normalize();
    return normal;
  }

  /**
   * Get terrain region based on height
   */
  static getRegionAt(x: number, z: number): TerrainRegion {
    const height = this.getHeightAt(x, z);
    const normal = this.getNormalAt(x, z);
    const slope = 1 - normal.y; // 0 = flat, 1 = vertical
    const { waterLevel } = TERRAIN_CONFIG;

    if (height < waterLevel - 3) return 'deep_water';
    if (height < waterLevel) return 'shallow_water';
    if (height < waterLevel + 1.5) return 'sand';
    if (height < 8) {
      if (slope > 0.4) return 'rock';
      return 'grass';
    }
    if (height < 15) {
      if (slope > 0.3) return 'rock';
      return 'forest';
    }
    if (height < 22) return 'rock';
    return 'snow';
  }

  /**
   * Get color for region (for vertex coloring)
   */
  static getRegionColor(region: TerrainRegion): [number, number, number] {
    switch (region) {
      case 'deep_water': return [0.05, 0.15, 0.35];
      case 'shallow_water': return [0.15, 0.45, 0.65];
      case 'sand': return [0.85, 0.78, 0.55];
      case 'grass': return [0.35, 0.65, 0.25];
      case 'forest': return [0.20, 0.45, 0.15];
      case 'rock': return [0.45, 0.42, 0.38];
      case 'snow': return [0.95, 0.95, 0.98];
      default: return [0.5, 0.5, 0.5];
    }
  }
}

export type TerrainRegion = 
  | 'deep_water' 
  | 'shallow_water' 
  | 'sand' 
  | 'grass' 
  | 'forest' 
  | 'rock' 
  | 'snow';
