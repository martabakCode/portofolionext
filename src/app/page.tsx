import { Suspense } from 'react';
import { SiteService } from "@/modules/site/site.service";
import { ProfileService } from "@/modules/profile/profile.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { PostsService } from "@/modules/posts/posts.service";
import { ExperienceService } from "@/modules/experience/experience.service";
import { TechStackService } from "@/modules/techstack/techstack.service";
import LandingClient from "./LandingClient";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  try {
    const siteService = new SiteService();
    const config = await siteService.getSiteConfig();
    return {
      title: config?.site_name || "Portfolio",
      description: config?.site_description || "Personal Portfolio",
    };
  } catch {
    return { title: "Portfolio", description: "Personal Portfolio" };
  }
}

export default async function HomePage() {
  // Fetch all data from admin
  const siteService = new SiteService();
  const profileService = new ProfileService();
  const projectsService = new ProjectsService();
  const postsService = new PostsService();
  const experienceService = new ExperienceService();
  const techStackService = new TechStackService();

  const [siteConfig, profile, projects, posts, experiences, techStacks] = await Promise.all([
    siteService.getSiteConfig().catch(() => null),
    profileService.getProfile().catch(() => null),
    projectsService.getProjects().catch(() => []),
    postsService.getPosts(true).catch(() => []),
    experienceService.getExperiences().catch(() => []),
    techStackService.getTechStacks().catch(() => []),
  ]);

  return (
    <main className="w-full overflow-x-hidden">
      <Suspense fallback={
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4" />
            <p className="text-white font-bold text-lg">Loading...</p>
          </div>
        </div>
      }>
        <LandingClient 
          siteConfig={siteConfig}
          profile={profile}
          projects={projects}
          posts={posts}
          experiences={experiences}
          techStacks={techStacks}
        />
      </Suspense>
    </main>
  );
}
