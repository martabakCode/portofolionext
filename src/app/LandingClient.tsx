'use client';

import dynamic from 'next/dynamic';
import { SiteConfig } from "@/modules/site/site.types";
import { Profile } from "@/modules/profile/profile.types";
import { Project } from "@/modules/projects/projects.types";
import { Post } from "@/modules/posts/posts.types";
import { Experience } from "@/modules/experience/experience.types";
import { TechStack } from "@/modules/techstack/techstack.types";

const LandingExperience = dynamic(
  () => import('@/components/LandingExperience').then(mod => mod.LandingExperience),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Loading 3D Experience...</p>
        </div>
      </div>
    )
  }
);

interface LandingClientProps {
  siteConfig: SiteConfig | null;
  profile: Profile | null;
  projects: Project[];
  posts: Post[];
  experiences: Experience[];
  techStacks: TechStack[];
}

export default function LandingClient({
  siteConfig,
  profile,
  projects,
  posts,
  experiences,
  techStacks,
}: LandingClientProps) {
  return (
    <LandingExperience 
      siteConfig={siteConfig}
      profile={profile}
      projects={projects}
      posts={posts}
      experiences={experiences}
      techStacks={techStacks}
    />
  );
}
