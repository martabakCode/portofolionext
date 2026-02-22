import { createClient } from "@/lib/supabaseServer";
import type { Project, CreateProjectDTO, UpdateProjectDTO } from "./projects.types";

export class ProjectsRepository {
    async createProject(project: CreateProjectDTO): Promise<Project> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("projects")
            .insert(project)
            .select()
            .single();

        if (error) {
            console.error("[ProjectsRepo] Create error:", error);
            throw new Error("Failed to create project");
        }

        return data;
    }

    async getProjects(): Promise<Project[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[ProjectsRepo] GetProjects error:", error);
            return [];
        }

        return data;
    }

    async updateProject(id: string, updates: UpdateProjectDTO): Promise<Project> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("projects")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error("Failed to update project");
        return data;
    }

    async getProjectById(id: string): Promise<Project | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .eq("id", id)
            .single();

        if (error) return null;
        return data;
    }



    async deleteProject(id: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) throw new Error("Failed to delete project");
    }
}
