'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { BoothConfig } from './BoothData';

interface ProjectPanelProps {
    // If we decide to pass data directly, otherwise pull from store
}

// Helper to find booth by ID if needed, or pass activeBoothId
const ProjectPanel: React.FC = () => {
    const activeBoothData = useGameStore((state) => state.activeBoothData) as BoothConfig | null;
    const closeBazaarBooth = useGameStore((state) => state.closeBazaarBooth);

    if (!activeBoothData) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                onClick={() => closeBazaarBooth()}
            />

            <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl mx-4 pointer-events-auto flex flex-col overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header with Image Background if available */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-900 px-8 py-8 relative overflow-hidden shrink-0">
                    {activeBoothData.imageUrl && (
                        <div className="absolute inset-0 z-0">
                            <img src={activeBoothData.imageUrl} alt="" className="w-full h-full object-cover opacity-20" />
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 to-teal-900/40" />
                        </div>
                    )}

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-black/30 border border-white/10 rounded-full text-xs font-mono uppercase tracking-widest text-teal-200 backdrop-blur-sm">
                                {activeBoothData.type}
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight shadow-black drop-shadow-lg">{activeBoothData.title}</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto bg-zinc-900">
                    {/* Description */}
                    <div className="prose prose-invert max-w-none text-zinc-300 font-light text-lg leading-relaxed mb-8">
                        <p>{activeBoothData.description || "No description provided."}</p>
                    </div>

                    {/* Tech Stack */}
                    {activeBoothData.techStack && activeBoothData.techStack.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Technology Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {activeBoothData.techStack.map((tech) => (
                                    <span key={tech} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 text-sm font-medium hover:bg-zinc-750 transition-colors">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="border-t border-zinc-800 p-6 flex justify-end gap-4 bg-zinc-950/50 shrink-0">
                    <button
                        onClick={() => closeBazaarBooth()}
                        className="px-6 py-3 text-zinc-400 hover:text-white font-bold transition-colors"
                    >
                        Dimiss
                    </button>

                    {activeBoothData.link && (
                        <a
                            href={activeBoothData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-900/20 flex items-center gap-2"
                        >
                            <span>View Project</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ProjectPanel;
