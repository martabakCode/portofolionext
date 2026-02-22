/**
 * GameUI - Root UI Component
 * 
 * Purpose: Compose all UI overlays
 */

'use client';

import React from 'react';
import OfficePanel from './OfficePanel';
import DebugOverlay from './DebugOverlay';
import InteractionPrompt from './InteractionPrompt';
import ProjectPanel from '@/world/bazaar/ProjectPanel';

const GameUI: React.FC = () => {
  return (
    <>
      {/* Debug panel - top left */}
      <DebugOverlay />

      {/* Interaction prompt - bottom center */}
      <InteractionPrompt />

      {/* Office panel - center modal */}
      <OfficePanel />

      {/* Bazaar Project Panel */}
      <ProjectPanel />
    </>
  );
};

export default GameUI;
