/**
 * InteractionPrompt - Floating Interaction UI
 * 
 * Purpose: Show interaction prompt when near interactable objects
 */

'use client';

import React from 'react';
import { useGameStore, useInteractionPrompt } from '@/store/useGameStore';

const InteractionPrompt: React.FC = () => {
  const prompt = useInteractionPrompt();
  const activeInteraction = useGameStore((state) => state.activeInteraction);

  if (!prompt || !activeInteraction) return null;

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div className="flex items-center gap-3 bg-black/70 backdrop-blur px-5 py-3 rounded-full border border-white/20 shadow-lg animate-in fade-in slide-in-from-bottom-4">
        {/* Key hint */}
        <kbd className="w-8 h-8 flex items-center justify-center bg-white text-slate-900 font-bold rounded-lg text-sm shadow-lg">
          E
        </kbd>
        
        {/* Prompt text */}
        <span className="text-white font-medium whitespace-nowrap">
          {prompt}
        </span>

        {/* Animated dots */}
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default InteractionPrompt;
