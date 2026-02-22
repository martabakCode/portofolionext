/**
 * BaseBuilding - Abstract Building Class
 * 
 * Architecture Pattern: Template Method Pattern
 * Purpose: Define common building behavior, allow specific implementations
 * 
 * Features:
 * - Position management
 * - Interaction zone registration
 * - Lifecycle hooks
 */

import { Vector3 } from 'three';
import { BuildingConfig, BuildingData } from '@/types/game';
import { interactionSystem } from '@/core/InteractionSystem';
import { worldManager } from '@/core/WorldManager';
import { eventBus } from '@/core/EventBus';

abstract class BaseBuilding {
  protected config: BuildingConfig;
  protected data: BuildingData;
  protected isRegistered: boolean = false;

  constructor(config: BuildingConfig, data: BuildingData) {
    this.config = { ...config };
    this.data = { ...data };
  }

  /**
   * Initialize the building
   * Called once when building is placed in world
   */
  initialize(): void {
    if (this.isRegistered) {
      console.warn(`[BaseBuilding] ${this.data.id} already initialized`);
      return;
    }

    // Register with WorldManager
    worldManager.registerBuilding(this.data.id, this.config.position);

    // Register interaction zone
    this.registerInteraction();

    // Building-specific initialization
    this.onInitialize();

    this.isRegistered = true;
    console.log(`[BaseBuilding] Initialized: ${this.data.name}`);
  }

  /**
   * Register interaction zone with InteractionSystem
   */
  protected registerInteraction(): void {
    interactionSystem.register({
      id: this.data.id,
      position: this.config.position,
      radius: 4, // Default interaction radius
      promptText: `Press E to enter ${this.data.name}`,
      onEnter: () => this.onPlayerEnter(),
      onExit: () => this.onPlayerExit(),
      onInteract: () => this.onInteract(),
    });
  }

  /**
   * Unregister building from systems
   */
  dispose(): void {
    if (!this.isRegistered) return;

    interactionSystem.unregister(this.data.id);
    this.onDispose();
    
    this.isRegistered = false;
    console.log(`[BaseBuilding] Disposed: ${this.data.name}`);
  }

  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------

  getId(): string {
    return this.data.id;
  }

  getName(): string {
    return this.data.name;
  }

  getPosition(): Vector3 {
    return this.config.position.clone();
  }

  getData(): BuildingData {
    return { ...this.data };
  }

  // -------------------------------------------------------------------------
  // Abstract Methods - Must be implemented by subclasses
  // -------------------------------------------------------------------------

  /**
   * Called during initialization, after common setup
   */
  protected abstract onInitialize(): void;

  /**
   * Called when player enters interaction zone
   */
  protected abstract onPlayerEnter(): void;

  /**
   * Called when player exits interaction zone
   */
  protected abstract onPlayerExit(): void;

  /**
   * Called when player presses 'E' in interaction zone
   */
  protected abstract onInteract(): void;

  /**
   * Called during disposal
   */
  protected abstract onDispose(): void;

  /**
   * Upgrade the building
   */
  abstract upgrade(): boolean;

  /**
   * Get upgrade cost/info
   */
  abstract getUpgradeInfo(): { cost: number; description: string } | null;
}

export { BaseBuilding };
