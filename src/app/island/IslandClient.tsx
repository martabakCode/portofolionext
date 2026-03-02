'use client';

import { useState, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loading } from '@/components/three/shared/Loading';

// Dynamic import for IslandScene to avoid SSR issues with Three.js
const IslandScene = dynamic(
  () => import('@/components/three/island').then(mod => mod.IslandScene),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

type TimeOfDay = 'day' | 'sunset' | 'night';

export function IslandClient() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  return (
    <div className="relative w-full h-full">
      {/* Time of Day Controls */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex gap-2">
          <TimeButton
            active={timeOfDay === 'day'}
            onClick={() => setTimeOfDay('day')}
            icon="☀️"
            label="Day"
          />
          <TimeButton
            active={timeOfDay === 'sunset'}
            onClick={() => setTimeOfDay('sunset')}
            icon="🌅"
            label="Sunset"
          />
          <TimeButton
            active={timeOfDay === 'night'}
            onClick={() => setTimeOfDay('night')}
            icon="🌙"
            label="Night"
          />
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <h1 className="text-white font-bold text-lg">Voxel Island</h1>
          <p className="text-white/70 text-sm">Procedural Generation</p>
        </div>
      </div>

      {/* 3D Scene */}
      <Suspense fallback={<Loading />}>
        <IslandScene
          timeOfDay={timeOfDay}
          treeCount={50}
          showClouds={true}
          config={{
            width: 64,
            depth: 64,
            maxHeight: 16,
            waterLevel: 3,
            noiseScale: 0.045,
            islandRadius: 26,
          }}
        />
      </Suspense>
    </div>
  );
}

interface TimeButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

function TimeButton({ active, onClick, icon, label }: TimeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-2 rounded-md font-medium text-sm transition-all
        flex items-center gap-2
        ${active 
          ? 'bg-blue-600 text-white' 
          : 'bg-white/10 text-white/80 hover:bg-white/20'
        }
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
