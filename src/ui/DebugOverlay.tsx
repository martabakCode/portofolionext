/**
 * DebugOverlay - Development Debug Panel
 * 
 * Purpose: Display runtime debug information
 * Shows: Player state, position, FPS, etc.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore, usePlayerState, usePlayerPosition, useTimeOfDay } from '@/store/useGameStore';
import { gameManager } from '@/core/GameManager';
import { interactionSystem } from '@/core/InteractionSystem';

const DebugOverlay: React.FC = () => {
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(Date.now());
  const [isDebugMode, setIsDebugMode] = useState(false);
  
  // Get reactive state
  const playerState = usePlayerState();
  const playerPosition = usePlayerPosition();
  const timeOfDay = useTimeOfDay();
  const isPaused = useGameStore((state) => state.isPaused);
  const activeInteraction = useGameStore((state) => state.activeInteraction);

  // Calculate FPS
  useEffect(() => {
    let animationId: number;
    
    const updateFps = () => {
      setFrameCount(prev => prev + 1);
      const now = Date.now();
      
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        setFrameCount(0);
        setLastTime(now);
      }
      
      animationId = requestAnimationFrame(updateFps);
    };
    
    animationId = requestAnimationFrame(updateFps);
    return () => cancelAnimationFrame(animationId);
  }, [frameCount, lastTime]);

  // Toggle debug mode with backtick
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        gameManager.toggleDebugMode();
        setIsDebugMode(gameManager.isDebugMode());
      }
      if (e.key === 'Escape') {
        const { isOfficeOpen, closeOffice } = useGameStore.getState();
        if (isOfficeOpen) closeOffice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Don't render if not in debug mode
  if (!isDebugMode) return null;

  return (
    <div className="fixed top-4 left-4 z-50 pointer-events-none">
      <div className="bg-black/80 backdrop-blur text-green-400 font-mono text-sm p-4 rounded-lg border border-green-500/30 shadow-lg min-w-[280px]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-500/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="font-bold">DEBUG MODE</span>
          <span className="ml-auto text-xs text-green-500/60">Press ` to toggle</span>
        </div>

        {/* FPS Counter */}
        <div className="mb-3">
          <div className="flex justify-between">
            <span className="text-green-500/60">FPS:</span>
            <span className={fps < 30 ? 'text-red-400' : fps < 50 ? 'text-yellow-400' : 'text-green-400'}>
              {fps}
            </span>
          </div>
          <div className="w-full h-1 bg-green-500/20 rounded mt-1">
            <div 
              className="h-full bg-green-400 rounded transition-all"
              style={{ width: `${Math.min(fps, 60) / 60 * 100}%` }}
            />
          </div>
        </div>

        {/* Player State */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between">
            <span className="text-green-500/60">State:</span>
            <span className="uppercase">{playerState}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-500/60">Paused:</span>
            <span>{isPaused ? 'YES' : 'NO'}</span>
          </div>
        </div>

        {/* Position */}
        <div className="mb-3">
          <span className="text-green-500/60">Position:</span>
          <div className="pl-2 text-xs">
            X: {playerPosition.x.toFixed(2)}<br />
            Y: {playerPosition.y.toFixed(2)}<br />
            Z: {playerPosition.z.toFixed(2)}
          </div>
        </div>

        {/* Interaction */}
        <div className="mb-3">
          <div className="flex justify-between">
            <span className="text-green-500/60">Interaction:</span>
            <span>{activeInteraction || 'None'}</span>
          </div>
        </div>

        {/* Time */}
        <div className="mb-3">
          <div className="flex justify-between">
            <span className="text-green-500/60">Time:</span>
            <span className="capitalize">{timeOfDay}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-green-500/30 space-y-1">
          <p className="text-xs text-green-500/60 mb-2">Shortcuts:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><kbd className="bg-green-500/20 px-1 rounded">WASD</kbd> Move</div>
            <div><kbd className="bg-green-500/20 px-1 rounded">Shift</kbd> Sprint</div>
            <div><kbd className="bg-green-500/20 px-1 rounded">E</kbd> Interact</div>
            <div><kbd className="bg-green-500/20 px-1 rounded">T</kbd> Time</div>
            <div><kbd className="bg-green-500/20 px-1 rounded">F5</kbd> Save</div>
            <div><kbd className="bg-green-500/20 px-1 rounded">ESC</kbd> Close UI</div>
          </div>
        </div>

        {/* Interaction Zones */}
        <div className="mt-3 pt-2 border-t border-green-500/30">
          <p className="text-xs text-green-500/60 mb-1">Zones:</p>
          {interactionSystem.getAllZones().map(zone => (
            <div key={zone.id} className="text-xs flex items-center gap-2">
              <span className={zone.isActive ? 'text-green-400' : 'text-green-500/40'}>
                {zone.isActive ? '●' : '○'}
              </span>
              {zone.id}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugOverlay;
