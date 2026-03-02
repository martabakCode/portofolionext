'use client';

import { useProgress } from '@react-three/drei';

/**
 * Loading indicator for Three.js canvas
 */
export function Loading() {
  const { progress, active } = useProgress();

  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-medium">Loading Island...</p>
        <p className="text-slate-400 text-sm">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}

/**
 * Error boundary for Three.js components
 */
export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-50">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Failed to load 3D scene</h3>
        <p className="text-slate-400 text-sm">{error.message}</p>
      </div>
    </div>
  );
}
