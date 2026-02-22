"use server";

import { ProjectsService } from "@/modules/projects/projects.service";
import { CreateProjectDTO } from "@/modules/projects/projects.types";
import { revalidatePath } from "next/cache";

const projectsService = new ProjectsService();

export async function createProjectAction(dto: CreateProjectDTO) {
    try {
        await projectsService.createProject(dto);
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
