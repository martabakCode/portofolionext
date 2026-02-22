/**
 * InteractionSystem - Modular Proximity Detection
 * 
 * Architecture Pattern: Registry Pattern with Spatial Query
 * Purpose: Decouple interaction detection from player/rendering logic
 * 
 * Design Principles:
 * - Single Responsibility: Only handles proximity detection
 * - Open/Closed: New interactables can be added without modifying existing code
 * - Dependency Inversion: Player depends on InteractionSystem, not vice versa
 */

import { Vector3 } from 'three';
import { InteractionZone } from '@/types/game';
import { eventBus } from './EventBus';

class InteractionSystem {
  private zones: Map<string, InteractionZone> = new Map();
  private playerPosition: Vector3 = new Vector3();
  private lastNearestZone: string | null = null;
  private isEnabled: boolean = true;

  /**
   * Register a new interaction zone
   * Example usage:
   * InteractionSystem.register({
   *   id: 'coastal-office',
   *   position: new Vector3(10, 0, 10),
   *   radius: 3,
   *   onInteract: () => openOfficeUI(),
   *   promptText: 'Press E to enter'
   * });
   */
  register(zone: Omit<InteractionZone, 'isActive'>): void {
    if (this.zones.has(zone.id)) {
      console.warn(`[InteractionSystem] Zone ${zone.id} already exists, overwriting`);
    }

    this.zones.set(zone.id, {
      ...zone,
      isActive: false,
    });

    console.log(`[InteractionSystem] Registered zone: ${zone.id}`);
  }

  /**
   * Unregister an interaction zone
   */
  unregister(id: string): void {
    const zone = this.zones.get(id);
    if (zone && zone.isActive) {
      zone.onExit?.();
    }
    this.zones.delete(id);
  }

  /**
   * Update player position and check all zones
   * Called every frame by GameManager
   */
  updatePlayerPosition(position: Vector3): void {
    if (!this.isEnabled) return;

    this.playerPosition.copy(position);
    
    let nearestZone: string | null = null;
    let nearestDistance = Infinity;

    // Check all zones for proximity
    this.zones.forEach((zone, id) => {
      const distance = position.distanceTo(zone.position);
      const wasActive = zone.isActive;
      const isActive = distance <= zone.radius;

      // Update zone state
      zone.isActive = isActive;

      // Handle enter/exit events
      if (!wasActive && isActive) {
        zone.onEnter?.();
        eventBus.emit('interaction:enter', { id, zone });
      } else if (wasActive && !isActive) {
        zone.onExit?.();
        eventBus.emit('interaction:exit', { id, zone });
      }

      // Track nearest zone for interaction priority
      if (isActive && distance < nearestDistance) {
        nearestDistance = distance;
        nearestZone = id;
      }
    });

    // Update global state if nearest zone changed
    if (nearestZone !== this.lastNearestZone) {
      this.lastNearestZone = nearestZone;
      
      // Emit to store for UI updates
      eventBus.emit('interaction:trigger', {
        activeId: nearestZone,
        prompt: nearestZone ? this.zones.get(nearestZone)?.promptText : null,
      });
    }
  }

  /**
   * Trigger interaction with the nearest active zone
   * Called when player presses 'E'
   */
  triggerInteraction(): void {
    if (!this.lastNearestZone) return;

    const zone = this.zones.get(this.lastNearestZone);
    if (zone) {
      console.log(`[InteractionSystem] Triggered: ${zone.id}`);
      zone.onInteract();
    }
  }

  /**
   * Get the currently active zone (nearest to player)
   */
  getActiveZone(): InteractionZone | null {
    return this.lastNearestZone ? this.zones.get(this.lastNearestZone) || null : null;
  }

  /**
   * Enable/disable the entire interaction system
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if player is near any interactable
   */
  isNearInteractable(): boolean {
    return this.lastNearestZone !== null;
  }

  /**
   * Get all registered zones (for debugging)
   */
  getAllZones(): InteractionZone[] {
    return Array.from(this.zones.values());
  }

  /**
   * Clear all zones (cleanup)
   */
  clear(): void {
    this.zones.clear();
    this.lastNearestZone = null;
  }
}

// Singleton instance
export const interactionSystem = new InteractionSystem();

// Also export class for testing/extensibility
export { InteractionSystem };
