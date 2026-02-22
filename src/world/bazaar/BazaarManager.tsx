'use client';

import React, { useMemo } from 'react';
import { Booth } from './Booth';
import { BoothConfig } from './BoothData';

interface BazaarManagerProps {
    projects: any[]; // Assuming we get Project[] from props
}

export function BazaarManager({ projects }: BazaarManagerProps) {
    // Convert projects to booth configs
    const booths = useMemo(() => {
        if (!projects || projects.length === 0) return [];

        // Layout Logic:
        // Place booths in a semi-circle or grid around a central point.
        // Origin for Bazaar: Let's assume it's at [X: 20, Z: 20] (Right side of map, near beach)
        // Actually, user sketch showed:
        // Office (Center) -> Path -> Bazaar -> Beach
        // So Bazaar could be at [0, 0, 15] -> Beach uses Z+.
        // Beach is at Z ~ 30-50 based on Water level (Water is usually at -100 Z in Environment but let's recheck)
        // Looking at Environment.ts: Water position is at [-40, -0.05, 0]. Wait.
        // Ocean.tsx: size=100.

        // Let's place Bazaar at Z = 25.

        // Position logic:
        // 5 booths max.
        // Arrange in an arc.

        const count = Math.min(projects.length, 5);
        const radius = 12;
        const centerZ = 25;
        const centerX = 0;

        return projects.slice(0, 5).map((project, index) => {
            const angleStep = Math.PI / (count + 1); // Spacing
            // Arc from -PI/2 to PI/2? No, arc facing the office (facing -Z).
            // Circle center at [0, 0, 25].
            // Booths should face the player coming from [0,0,0] (Office).
            // So booths at Z=25, arranged along X azis? 
            // Or arc: -45 deg to +45 deg.

            const angle = -Math.PI / 4 + (index / (Math.max(1, count - 1))) * (Math.PI / 2); // Spread over 90 degrees

            // Position on arc
            const x = centerX + Math.sin(angle) * radius;
            const z = centerZ + Math.cos(angle) * radius * 0.5; // Elliptical arc

            // Calculate rotation to face center (0,0,0ish) or just face forward (-Z)
            // Let's face -Z (towards office) but slightly inward.
            const rotY = Math.PI + angle; // Face inward to center of arc

            const config: BoothConfig = {
                id: project.id,
                title: project.title,
                description: project.description,
                techStack: project.tech_stack || [],
                link: project.link,
                type: 'project',
                imageUrl: project.image_url,
                position: [x, 0, z],
                rotation: [0, rotY + Math.PI, 0] // Correction
            };
            return config;
        });

    }, [projects]);

    return (
        <group name="bazaar-area">
            {/* Floor/Deck for Bazaar Area */}
            <mesh position={[0, -0.05, 30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[20, 32]} />
                <meshStandardMaterial color="#d4b483" roughness={0.9} />
            </mesh>

            {booths.map((booth) => (
                <Booth key={booth.id} config={booth} />
            ))}
        </group>
    );
}
