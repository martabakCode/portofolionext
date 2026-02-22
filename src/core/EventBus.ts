/**
 * EventBus - Central Event System
 * 
 * Architecture Pattern: Observer Pattern
 * Purpose: Decoupled communication between game systems
 * 
 * Benefits:
 * - Systems don't need direct references to each other
 * - Easy to add new event types without modifying existing code
 * - Supports multiple listeners for the same event
 * - Debug-friendly: can log all events in one place
 */

import { GameEventType, EventCallback } from '@/types/game';

type EventHandler = {
  callback: EventCallback;
  once: boolean;
};

class EventBus {
  private listeners: Map<GameEventType, EventHandler[]> = new Map();
  private debugMode: boolean = false;

  /**
   * Enable/disable debug logging
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Subscribe to an event
   * @param event - Event type to listen for
   * @param callback - Function to call when event fires
   * @returns Unsubscribe function
   */
  on(event: GameEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push({ callback, once: false });
    
    if (this.debugMode) {
      console.log(`[EventBus] Subscribed to: ${event}`);
    }

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event for one-time execution
   * @param event - Event type to listen for
   * @param callback - Function to call once when event fires
   */
  once(event: GameEventType, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push({ callback, once: true });
  }

  /**
   * Unsubscribe from an event
   */
  off(event: GameEventType, callback: EventCallback): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    const index = handlers.findIndex(h => h.callback === callback);
    if (index !== -1) {
      handlers.splice(index, 1);
    }

    if (this.debugMode) {
      console.log(`[EventBus] Unsubscribed from: ${event}`);
    }
  }

  /**
   * Emit an event to all subscribers
   * @param event - Event type to emit
   * @param payload - Data to pass to subscribers
   */
  emit(event: GameEventType, payload?: unknown): void {
    if (this.debugMode) {
      console.log(`[EventBus] Emit: ${event}`, payload);
    }

    const handlers = this.listeners.get(event);
    if (!handlers) return;

    // Iterate backwards to safely handle unsubscribes during iteration
    for (let i = handlers.length - 1; i >= 0; i--) {
      const handler = handlers[i];
      
      try {
        handler.callback(payload);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${event}:`, error);
      }

      // Remove once listeners after execution
      if (handler.once) {
        handlers.splice(i, 1);
      }
    }
  }

  /**
   * Remove all listeners (useful for cleanup)
   */
  clear(): void {
    this.listeners.clear();
    
    if (this.debugMode) {
      console.log('[EventBus] All listeners cleared');
    }
  }

  /**
   * Get count of active listeners for debugging
   */
  getListenerCount(event?: GameEventType): number {
    if (event) {
      return this.listeners.get(event)?.length || 0;
    }
    
    let total = 0;
    this.listeners.forEach(handlers => total += handlers.length);
    return total;
  }
}

// Singleton instance - shared across the application
export const eventBus = new EventBus();

// Hook-friendly export for React components
export { EventBus };
