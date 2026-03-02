/**
 * Color palette for island voxels
 */

export const VOXEL_COLORS = {
  sand: {
    base: 0xe6c288,
    variations: [0xe6c288, 0xd4b076, 0xdeb887, 0xf5deb3],
  },
  grass: {
    base: 0x5a9a4b,
    variations: [0x5a9a4b, 0x4a8a3b, 0x6ab05b, 0x5a9a4b],
  },
  stone: {
    base: 0x808080,
    variations: [0x808080, 0x707070, 0x909090, 0x888888],
  },
  dirt: {
    base: 0x5c4033,
    variations: [0x5c4033, 0x4a332a, 0x6e4c3d, 0x5c4033],
  },
  water: {
    base: 0x249fde,
    variations: [0x249fde, 0x1a8fc9, 0x2eafe9, 0x249fde],
  },
  wood: {
    base: 0x4a3728,
    variations: [0x4a3728, 0x3d2d20, 0x574130],
  },
  leaves: {
    base: 0x2d5016,
    variations: [0x2d5016, 0x254012, 0x356018, 0x2d5016],
  },
} as const;

export type VoxelType = keyof typeof VOXEL_COLORS;

/**
 * Get random color variation for a voxel type
 */
export function getVoxelColor(type: VoxelType): number {
  const colors = VOXEL_COLORS[type].variations;
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get base color for a voxel type
 */
export function getBaseColor(type: VoxelType): number {
  return VOXEL_COLORS[type].base;
}
