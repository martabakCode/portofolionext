"use server";

import { PostsService } from "@/modules/posts/posts.service";
import { ProjectsService } from "@/modules/projects/projects.service";
import { ProfileService } from "@/modules/profile/profile.service";
import { ExperienceService } from "@/modules/experience/experience.service";
import { SiteService } from "@/modules/site/site.service";
import { TechStackService } from "@/modules/techstack/techstack.service";
import { revalidatePath } from "next/cache";

const postsService = new PostsService();
const projectsService = new ProjectsService();
const profileService = new ProfileService();
const experienceService = new ExperienceService();
const siteService = new SiteService();
const techStackService = new TechStackService();

export async function getDashboardData() {
    const posts = await postsService.getPosts(false); // Get all posts (including drafts)
    const projects = await projectsService.getProjects();
    const profile = await profileService.getProfile();
    const experiences = await experienceService.getExperiences();

    return {
        posts,
        projects,
        profile,
        experiences,
        stats: {
            postsCount: posts.length,
            projectsCount: projects.length,
            experiencesCount: experiences.length,
        },
    };
}



export async function deletePostAction(id: string) {
    try {
        await postsService.deletePost(id);
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteProjectAction(id: string) {
    try {
        await projectsService.deleteProject(id);
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getPostAction(id: string) {
    try {
        const post = await postsService.getPostById(id);
        if (!post) throw new Error("Post not found");
        return { success: true, data: post };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// ... (existing code)

export async function updatePostAction(id: string, dto: any) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await postsService.updatePost(id, dto);
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getProjectAction(id: string) {
    try {
        const project = await projectsService.getProjectById(id);
        if (!project) throw new Error("Project not found");
        return { success: true, data: project };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// ... (existing code)

export async function updateProjectAction(id: string, dto: any) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await projectsService.updateProject(id, dto);
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}



export async function getProfileAction() {
    try {
        const profile = await profileService.getProfile();
        return { success: true, data: profile };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// ... (existing code)

export async function updateProfileAction(dto: any) {
    try {
        await profileService.updateProfile(dto);
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}



export async function getExperiencesAction() {
    try {
        const experiences = await experienceService.getExperiences();
        return { success: true, data: experiences };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getExperienceAction(id: string) {
    try {
        const experience = await experienceService.getExperienceById(id);
        if (!experience) throw new Error("Experience not found");
        return { success: true, data: experience };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function createExperienceAction(dto: any) {
    try {
        await experienceService.createExperience(dto);
        revalidatePath("/admin/experience");
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updateExperienceAction(id: string, dto: any) {
    try {
        await experienceService.updateExperience(id, dto);
        revalidatePath("/admin/experience");
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteExperienceAction(id: string) {
    try {
        await experienceService.deleteExperience(id);
        revalidatePath("/admin/experience");
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getSiteConfigAction() {
    try {
        const config = await siteService.getSiteConfig();
        return { success: true, data: config };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updateSiteConfigAction(dto: any) {
    try {
        await siteService.updateSiteConfig(dto);
        revalidatePath("/admin/settings");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// Tech Stack Actions
export async function getTechStacksAction() {
    try {
        const techStacks = await techStackService.getTechStacks();
        return { success: true, data: techStacks };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getTechStackAction(id: string) {
    try {
        const techStack = await techStackService.getTechStackById(id);
        if (!techStack) throw new Error("Tech stack not found");
        return { success: true, data: techStack };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function createTechStackAction(dto: any) {
    try {
        await techStackService.createTechStack(dto);
        revalidatePath("/admin/techstack");
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updateTechStackAction(id: string, dto: any) {
    try {
        await techStackService.updateTechStack(id, dto);
        revalidatePath("/admin/techstack");
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteTechStackAction(id: string) {
    try {
        await techStackService.deleteTechStack(id);
        revalidatePath("/admin/techstack");
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
