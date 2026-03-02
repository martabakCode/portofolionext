import { Metadata } from 'next';
import { IslandClient } from './IslandClient';

export const metadata: Metadata = {
  title: 'Procedural Island Generator | Three.js',
  description: 'A voxel-based procedural island generator built with Three.js and React.',
};

export default function IslandPage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-slate-900">
      <IslandClient />
    </main>
  );
}
