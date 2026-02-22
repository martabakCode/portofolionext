/**
 * WorldManager - World Initialization & Lifecycle
 * 
 * Architecture Pattern: Facade Pattern
 * Purpose: Provide a simplified interface to the complex world subsystem
 * 
 * Responsibilities:
 * - Initialize terrain, ocean, lighting
 * - Manage world settings (time of day, environment)
 * - Handle world-level events
 */

import { Vector3 } from 'three';
import { WorldConfig } from '@/types/game';
import { eventBus } from './EventBus';

// Default world configuration
const DEFAULT_CONFIG: WorldConfig = {
  terrainSize: 200,
  oceanLevel: 0,
  timeOfDay: 'day',
  enableShadows: true,
};

class WorldManager {
  private config: WorldConfig;
  private isInitialized: boolean = false;
  private buildings: string[] = [];

  constructor(config: Partial<WorldConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the world
   * Called once by GameManager on game start
   */
  initialize(): void {
    if (this.isInitialized) {
      console.warn('[WorldManager] Already initialized');
      return;
    }

    console.log('[WorldManager] Initializing world...');
    
    // Emit initialization events for subsystems
    eventBus.emit('world:timeChange', this.config.timeOfDay);
    
    this.isInitialized = true;
    console.log('[WorldManager] World initialized successfully');
  }

  /**
   * Get world configuration
   */
  getConfig(): WorldConfig {
    return { ...this.config };
  }

  /**
   * Update world configuration
   */
  updateConfig(updates: Partial<WorldConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...updates };

    // Emit events for changed properties
    if (updates.timeOfDay && updates.timeOfDay !== oldConfig.timeOfDay) {
      eventBus.emit('world:timeChange', updates.timeOfDay);
    }
  }

  /**
   * Toggle between day, sunset, and night
   */
  cycleTimeOfDay(): void {
    const times: WorldConfig['timeOfDay'][] = ['day', 'sunset', 'night'];
    const currentIndex = times.indexOf(this.config.timeOfDay);
    const nextTime = times[(currentIndex + 1) % times.length];
    
    this.updateConfig({ timeOfDay: nextTime });
  }

  /**
   * Register a building in the world
   */
  registerBuilding(buildingId: string, position: Vector3): void {
    this.buildings.push(buildingId);
    console.log(`[WorldManager] Registered building: ${buildingId} at (${position.x}, ${position.y}, ${position.z})`);
  }

  /**
   * Get all registered buildings
   */
  getBuildings(): string[] {
    return [...this.buildings];
  }

  /**
   * Get spawn position for new players
   */
  getSpawnPosition(): Vector3 {
    // Spawn at a safe location away from buildings
    return new Vector3(0, 2, 20);
  }

  /**
   * Cleanup world resources
   */
  dispose(): void {
    console.log('[WorldManager] Disposing world...');
    this.buildings = [];
    this.isInitialized = false;
  }
}

// Singleton instance
export const worldManager = new WorldManager();

export { WorldManager };
