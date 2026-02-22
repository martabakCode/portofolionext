export interface BoothConfig {
    id: string;
    title: string;
    description: string;
    techStack: string[];
    link?: string;
    type: 'project' | 'skill' | 'blog' | 'social';
    imageUrl?: string;
    position: [number, number, number];
    rotation: [number, number, number];
}

export const MOCK_BOOTHS: BoothConfig[] = [
    {
        id: 'project-1',
        title: 'Featured Project',
        description: 'A revolutionary app that solves world hunger.',
        techStack: ['React', 'Node.js', 'AI'],
        link: '#',
        type: 'project',
        position: [0, 0, 0],
        rotation: [0, 0, 0]
    }
];
