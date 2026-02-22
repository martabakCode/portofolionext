/**
 * Game Type Definitions
 * Centralized type definitions for the entire game system
 */

import { Vector3 } from 'three';

// ============================================================================
// PLAYER TYPES
// ============================================================================

export enum PlayerState {
  IDLE = 'idle',
  WALK = 'walk',
  RUN = 'run',
  INTERACT = 'interact',
  JUMP = 'jump',
}

export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  interact: boolean;
  jump: boolean;
}

export interface PlayerConfig {
  walkSpeed: number;
  runSpeed: number;
  rotationSpeed: number;
  cameraHeight: number;
  cameraDistance: number;
  jumpForce?: number;
  gravity?: number;
}

// ============================================================================
// INTERACTION TYPES
// ============================================================================

export interface InteractionZone {
  id: string;
  position: Vector3;
  radius: number;
  onEnter?: () => void;
  onExit?: () => void;
  onInteract: () => void;
  promptText: string;
  isActive: boolean;
}

export interface InteractionConfig {
  id: string;
  position: Vector3;
  radius: number;
  promptText: string;
}

// ============================================================================
// BUILDING TYPES
// ============================================================================

export interface BuildingConfig {
  id: string;
  position: Vector3;
  rotation: number;
  scale: Vector3;
}

export interface BuildingData {
  id: string;
  name: string;
  level: number;
  isUpgradable: boolean;
}

// ============================================================================
// WORLD TYPES
// ============================================================================

export interface WorldConfig {
  terrainSize: number;
  oceanLevel: number;
  timeOfDay: 'day' | 'sunset' | 'night';
  enableShadows: boolean;
}

export interface GameSettings {
  debugMode: boolean;
  soundEnabled: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export type GameEventType =
  | 'player:stateChange'
  | 'player:move'
  | 'interaction:enter'
  | 'interaction:exit'
  | 'interaction:trigger'
  | 'building:open'
  | 'building:close'
  | 'game:save'
  | 'game:load'
  | 'world:timeChange';

export interface GameEvent {
  type: GameEventType;
  payload?: unknown;
}

export type EventCallback = (payload?: unknown) => void;
