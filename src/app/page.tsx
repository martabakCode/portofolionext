import { PostsService } from "@/modules/posts/posts.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { ProfileService } from "@/modules/profile/profile.service";
import { ExperienceService } from "@/modules/experience/experience.service";
import { SiteService } from "@/modules/site/site.service";
import { TechStackService } from "@/modules/techstack/techstack.service";
import ClientHomeWrapper from "@/components/ClientHomeWrapper";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const postsService = new PostsService();
  const projectsService = new ProjectsService();
  const profileService = new ProfileService();
  const experienceService = new ExperienceService();
  const siteService = new SiteService();
  const techStackService = new TechStackService();

  const [posts, projects, profile, experiences, siteConfig, techStacks] = await Promise.all([
    postsService.getPosts(true),
    projectsService.getProjects(),
    profileService.getProfile(),
    experienceService.getExperiences(),
    siteService.getSiteConfig(),
    techStackService.getTechStacks(),
  ]);

  return (
    <ClientHomeWrapper
      posts={posts}
      projects={projects}
      profile={profile}
      experiences={experiences}
      siteConfig={siteConfig}
      techStacks={techStacks}
    />
  );
}
