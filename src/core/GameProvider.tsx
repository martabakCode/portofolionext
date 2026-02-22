/**
 * GameProvider - React Context Provider for Game Systems
 * 
 * Purpose: Initialize game systems in React lifecycle
 * Provides: GameManager initialization and cleanup
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { gameManager } from './GameManager';
import { useGameStore } from '@/store/useGameStore';
import { eventBus } from './EventBus';

interface GameProviderProps {
  children: React.ReactNode;
}

const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const isInitialized = useRef(false);
  const isPaused = useGameStore((state) => state.isPaused);

  // Initialize game systems once
  useEffect(() => {
    if (isInitialized.current) return;

    console.log('[GameProvider] Initializing game systems...');
    
    // Initialize GameManager (which initializes other systems)
    gameManager.initialize();
    gameManager.start();

    // Setup event listeners for store synchronization
    const unsubscribeInteraction = eventBus.on('interaction:trigger', (data) => {
      const { activeId, prompt } = data as { activeId: string | null; prompt: string | null };
      useGameStore.getState().setActiveInteraction(activeId, prompt || undefined);
    });

    const unsubscribeTimeChange = eventBus.on('world:timeChange', (time) => {
      useGameStore.getState().setTimeOfDay(time as 'day' | 'sunset' | 'night');
    });

    const unsubscribeBuildingOpen = eventBus.on('building:open', () => {
      useGameStore.getState().openOffice();
    });

    isInitialized.current = true;

    // Cleanup on unmount
    return () => {
      console.log('[GameProvider] Cleaning up...');
      unsubscribeInteraction();
      unsubscribeTimeChange();
      unsubscribeBuildingOpen();
      gameManager.dispose();
    };
  }, []);

  // Game update loop
  useFrame((state, delta) => {
    if (!isPaused) {
      gameManager.update(delta);
    }
  });

  return <>{children}</>;
};

export default GameProvider;
