/**
 * Zustand Game Store - Global State Management
 * 
 * Purpose: Centralized reactive state for React components
 * Architecture: Flux-like unidirectional data flow
 * 
 * State Categories:
 * - Player State: position, current animation state
 * - Interaction State: active interactable, prompts
 * - UI State: panels visibility
 * - World State: time of day, environment settings
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Vector3 } from 'three';
import { PlayerState } from '@/types/game';

// ============================================================================
// STORE TYPES
// ============================================================================

interface GameState {
  // Player State
  playerPosition: Vector3;
  playerRotation: number;
  currentState: PlayerState;

  // Interaction State
  activeInteraction: string | null;
  interactionPrompt: string | null;

  // UI State
  isOfficeOpen: boolean;
  isDebugPanelOpen: boolean;
  activeBoothId: string | null;
  activeBoothData: any | null; // Using 'any' briefly to avoid circular deps or complex imports, but ideally BoothConfig

  // World State
  timeOfDay: 'day' | 'sunset' | 'night';
  isPaused: boolean;
}

interface GameActions {
  // Player Actions
  setPlayerPosition: (position: Vector3) => void;
  setPlayerRotation: (rotation: number) => void;
  setPlayerState: (state: PlayerState) => void;

  // Interaction Actions
  setActiveInteraction: (id: string | null, prompt?: string) => void;
  clearInteraction: () => void;

  // UI Actions
  openOffice: () => void;
  closeOffice: () => void;
  toggleDebugPanel: () => void;

  openBazaarBooth: (id: string, data?: any) => void;
  closeBazaarBooth: () => void;

  // World Actions
  setTimeOfDay: (time: 'day' | 'sunset' | 'night') => void;
  cycleTimeOfDay: () => void;
  setPaused: (paused: boolean) => void;
  togglePause: () => void;

  // Save/Load
  getSaveData: () => object;
  loadSaveData: (data: object) => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: GameState = {
  playerPosition: new Vector3(0, 2, 20),
  playerRotation: 0,
  currentState: PlayerState.IDLE,

  activeInteraction: null,
  interactionPrompt: null,

  isOfficeOpen: false,
  isDebugPanelOpen: false,
  activeBoothId: null,
  activeBoothData: null,

  timeOfDay: 'day',
  isPaused: false,
};

// ============================================================================
// STORE CREATION
// ============================================================================

export const useGameStore = create<GameState & GameActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // -------------------------------------------------------------------------
    // Player Actions
    // -------------------------------------------------------------------------
    setPlayerPosition: (position) => {
      set({ playerPosition: position.clone() });
    },

    setPlayerRotation: (rotation) => {
      set({ playerRotation: rotation });
    },

    setPlayerState: (state) => {
      set({ currentState: state });
    },

    // -------------------------------------------------------------------------
    // Interaction Actions
    // -------------------------------------------------------------------------
    setActiveInteraction: (id, prompt) => {
      set({
        activeInteraction: id,
        interactionPrompt: prompt || null
      });
    },

    clearInteraction: () => {
      set({
        activeInteraction: null,
        interactionPrompt: null
      });
    },

    // -------------------------------------------------------------------------
    // UI Actions
    // -------------------------------------------------------------------------
    openOffice: () => {
      set({ isOfficeOpen: true, isPaused: true });
    },

    closeOffice: () => {
      set({ isOfficeOpen: false, isPaused: false });
    },

    openBazaarBooth: (id, data) => {
      set({ activeBoothId: id, activeBoothData: data, isPaused: true });
    },

    closeBazaarBooth: () => {
      set({ activeBoothId: null, activeBoothData: null, isPaused: false });
    },

    toggleDebugPanel: () => {
      set((state) => ({ isDebugPanelOpen: !state.isDebugPanelOpen }));
    },

    // -------------------------------------------------------------------------
    // World Actions
    // -------------------------------------------------------------------------
    setTimeOfDay: (time) => {
      set({ timeOfDay: time });
    },

    cycleTimeOfDay: () => {
      const times: ('day' | 'sunset' | 'night')[] = ['day', 'sunset', 'night'];
      const currentIndex = times.indexOf(get().timeOfDay);
      set({ timeOfDay: times[(currentIndex + 1) % times.length] });
    },

    setPaused: (paused) => {
      set({ isPaused: paused });
    },

    togglePause: () => {
      set((state) => ({ isPaused: !state.isPaused }));
    },

    // -------------------------------------------------------------------------
    // Save/Load
    // -------------------------------------------------------------------------
    getSaveData: () => {
      const state = get();
      return {
        playerPosition: state.playerPosition.toArray(),
        playerRotation: state.playerRotation,
        currentState: state.currentState,
        timeOfDay: state.timeOfDay,
      };
    },

    loadSaveData: (data: object) => {
      const saveData = data as {
        playerPosition: number[];
        playerRotation: number;
        currentState: PlayerState;
        timeOfDay: 'day' | 'sunset' | 'night';
      };

      set({
        playerPosition: new Vector3(...saveData.playerPosition),
        playerRotation: saveData.playerRotation,
        currentState: saveData.currentState,
        timeOfDay: saveData.timeOfDay,
      });
    },
  }))
);

// ============================================================================
// SELECTOR HOOKS (for better performance)
// ============================================================================

// Use these in components to only re-render when specific state changes
export const usePlayerState = () => useGameStore((state) => state.currentState);
export const usePlayerPosition = () => useGameStore((state) => state.playerPosition);
export const useActiveInteraction = () => useGameStore((state) => state.activeInteraction);
export const useInteractionPrompt = () => useGameStore((state) => state.interactionPrompt);
export const useIsOfficeOpen = () => useGameStore((state) => state.isOfficeOpen);
export const useIsPaused = () => useGameStore((state) => state.isPaused);
export const useTimeOfDay = () => useGameStore((state) => state.timeOfDay);

// ============================================================================
// PERSISTENCE
// ============================================================================

// Auto-save to localStorage when state changes (optional)
if (typeof window !== 'undefined') {
  useGameStore.subscribe(
    (state) => ({
      playerPosition: state.playerPosition,
      currentState: state.currentState,
      timeOfDay: state.timeOfDay,
    }),
    (state) => {
      try {
        localStorage.setItem('coastal_world_autosave', JSON.stringify(state));
      } catch (e) {
        // Ignore storage errors
      }
    }
  );
}
