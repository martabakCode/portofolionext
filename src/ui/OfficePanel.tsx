/**
 * OfficePanel - Building UI Overlay
 */

'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';

const OfficePanel: React.FC = () => {
  const isOpen = useGameStore((state) => state.isOfficeOpen);
  const closeOffice = useGameStore((state) => state.closeOffice);

  // Handle close
  const handleClose = () => {
    closeOffice();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={handleClose}
      />
      
      {/* Panel */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md mx-4 pointer-events-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Coastal Office
          </h2>
          <p className="text-blue-200 text-sm mt-1">Coastal Management Center</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Building Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-slate-400 text-xs uppercase tracking-wide">Level</p>
              <p className="text-2xl font-bold text-white">1</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-slate-400 text-xs uppercase tracking-wide">Status</p>
              <p className="text-lg font-semibold text-green-400">Active</p>
            </div>
          </div>

          {/* Description */}
          <div className="text-slate-300 text-sm leading-relaxed">
            <p>
              Your coastal office serves as the central hub for managing your maritime operations. 
              Explore the coastal world and interact with various buildings.
            </p>
          </div>

          {/* Info Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Controls</h3>
            <div className="text-slate-400 text-sm space-y-1">
              <p><kbd className="bg-slate-700 px-2 py-0.5 rounded">WASD</kbd> - Move</p>
              <p><kbd className="bg-slate-700 px-2 py-0.5 rounded">SHIFT</kbd> - Sprint</p>
              <p><kbd className="bg-slate-700 px-2 py-0.5 rounded">E</kbd> - Interact</p>
              <p><kbd className="bg-slate-700 px-2 py-0.5 rounded">T</kbd> - Toggle time</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-4 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="absolute top-4 right-4 text-white/50 text-xs">
          Press <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd> to close
        </div>
      </div>
    </div>
  );
};

export default OfficePanel;
