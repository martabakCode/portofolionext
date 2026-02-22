/**
 * GameManager - Central Game Controller
 * 
 * Architecture Pattern: Singleton Controller
 * Purpose: Orchestrate all game systems and manage global game state
 * 
 * Responsibilities:
 * - Initialize all subsystems (WorldManager, InteractionSystem, etc.)
 * - Coordinate between player, world, and UI
 * - Handle game lifecycle (start, pause, save, load)
 * - Manage global settings and debug mode
 */

import { Vector3 } from 'three';
import { eventBus } from './EventBus';
import { interactionSystem } from './InteractionSystem';
import { worldManager } from './WorldManager';
import { PlayerState, GameSettings } from '@/types/game';

// Default game settings
const DEFAULT_SETTINGS: GameSettings = {
  debugMode: false,
  soundEnabled: true,
  graphicsQuality: 'high',
};

class GameManager {
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private settings: GameSettings = { ...DEFAULT_SETTINGS };
  
  // Player state reference (updated by PlayerController)
  private playerPosition: Vector3 = new Vector3();
  private playerState: PlayerState = PlayerState.IDLE;

  constructor() {
    // Bind methods for event handlers
    this.handleSave = this.handleSave.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
  }

  /**
   * Initialize the entire game
   * Call this once at application startup
   */
  initialize(): void {
    console.log('[GameManager] Initializing game...');

    // Initialize subsystems
    worldManager.initialize();
    
    // Setup event listeners
    this.setupEventListeners();

    // Load saved settings
    this.loadSettings();

    console.log('[GameManager] Game initialized');
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('[GameManager] Game started');
  }

  /**
   * Pause/unpause the game
   */
  togglePause(): void {
    this.isPaused = !this.isPaused;
    console.log(`[GameManager] Game ${this.isPaused ? 'paused' : 'resumed'}`);
  }

  /**
   * Update called every frame
   */
  update(deltaTime: number): void {
    if (!this.isRunning || this.isPaused) return;

    // Update interaction system with current player position
    interactionSystem.updatePlayerPosition(this.playerPosition);
  }

  /**
   * Update player position (called by PlayerController)
   */
  updatePlayerPosition(position: Vector3): void {
    this.playerPosition.copy(position);
  }

  /**
   * Update player state (called by PlayerStateMachine)
   */
  updatePlayerState(state: PlayerState): void {
    if (this.playerState !== state) {
      this.playerState = state;
      eventBus.emit('player:stateChange', state);
    }
  }

  /**
   * Handle interaction trigger (called when 'E' is pressed)
   */
  triggerInteraction(): void {
    interactionSystem.triggerInteraction();
  }

  /**
   * Setup event listeners for system-wide events
   */
  private setupEventListeners(): void {
    // Save/Load events
    eventBus.on('game:save', this.handleSave);
    eventBus.on('game:load', this.handleLoad);
  }

  /**
   * Handle save game event
   */
  handleSave(): void {
    const saveData = {
      playerPosition: this.playerPosition.toArray(),
      playerState: this.playerState,
      settings: this.settings,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem('coastal_world_save', JSON.stringify(saveData));
      console.log('[GameManager] Game saved');
    } catch (error) {
      console.error('[GameManager] Save failed:', error);
    }
  }

  /**
   * Handle load game event
   */
  private handleLoad(): void {
    try {
      const saveData = localStorage.getItem('coastal_world_save');
      if (saveData) {
        const parsed = JSON.parse(saveData);
        console.log('[GameManager] Save data loaded:', parsed);
        
        // Emit event with loaded data for other systems to handle
        eventBus.emit('player:move', new Vector3(...parsed.playerPosition));
      }
    } catch (error) {
      console.error('[GameManager] Load failed:', error);
    }
  }

  /**
   * Toggle debug mode
   */
  toggleDebugMode(): void {
    this.settings.debugMode = !this.settings.debugMode;
    eventBus.setDebugMode(this.settings.debugMode);
    console.log(`[GameManager] Debug mode: ${this.settings.debugMode ? 'ON' : 'OFF'}`);
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugMode(): boolean {
    return this.settings.debugMode;
  }

  /**
   * Get current settings
   */
  getSettings(): GameSettings {
    return { ...this.settings };
  }

  /**
   * Cycle time of day (for debugging)
   */
  cycleTimeOfDay(): void {
    worldManager.cycleTimeOfDay();
  }

  /**
   * Update settings
   */
  updateSettings(updates: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('coastal_world_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('[GameManager] Settings save failed:', error);
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('coastal_world_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('[GameManager] Settings load failed:', error);
    }
  }

  /**
   * Cleanup all systems
   */
  dispose(): void {
    console.log('[GameManager] Disposing game...');
    
    worldManager.dispose();
    interactionSystem.clear();
    eventBus.clear();
    
    this.isRunning = false;
  }

  // Getters for state
  getPlayerPosition(): Vector3 {
    return this.playerPosition.clone();
  }

  getPlayerState(): PlayerState {
    return this.playerState;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }
}

// Singleton instance - use this throughout the app
export const gameManager = new GameManager();

// Export class for testing
export { GameManager };
