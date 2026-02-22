import { createClient } from "@/lib/supabaseServer";
import type { Experience, CreateExperienceDTO, UpdateExperienceDTO } from "./experience.types";

export class ExperienceRepository {
    async getExperiences(): Promise<Experience[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("work_experiences")
            .select("*")
            .order("start_date", { ascending: false });

        if (error) return [];
        return data;
    }

    async getExperienceById(id: string): Promise<Experience | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("work_experiences")
            .select("*")
            .eq("id", id)
            .single();

        if (error) return null;
        return data;
    }

    async createExperience(dto: CreateExperienceDTO): Promise<Experience> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("work_experiences")
            .insert(dto)
            .select()
            .single();

        if (error) throw new Error("Failed to create experience: " + error.message);
        return data;
    }

    async updateExperience(id: string, updates: UpdateExperienceDTO): Promise<Experience> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("work_experiences")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error("Failed to update experience: " + error.message);
        return data;
    }

    async deleteExperience(id: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from("work_experiences")
            .delete()
            .eq("id", id);

        if (error) throw new Error("Failed to delete experience: " + error.message);
    }
}
