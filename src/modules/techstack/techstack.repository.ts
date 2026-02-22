import { createClient } from "@/lib/supabaseServer";
import type { TechStack, CreateTechStackDTO, UpdateTechStackDTO } from "./techstack.types";

export class TechStackRepository {
    async getTechStacks(): Promise<TechStack[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("tech_stacks")
            .select("*")
            .order("display_order", { ascending: true })
            .order("name", { ascending: true });

        if (error) return [];
        return data;
    }

    async getTechStackById(id: string): Promise<TechStack | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("tech_stacks")
            .select("*")
            .eq("id", id)
            .single();

        if (error) return null;
        return data;
    }

    async getTechStacksByCategory(category: string): Promise<TechStack[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("tech_stacks")
            .select("*")
            .eq("category", category)
            .order("display_order", { ascending: true });

        if (error) return [];
        return data;
    }

    async createTechStack(dto: CreateTechStackDTO): Promise<TechStack> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("tech_stacks")
            .insert(dto)
            .select()
            .single();

        if (error) throw new Error("Failed to create tech stack: " + error.message);
        return data;
    }

    async updateTechStack(id: string, updates: UpdateTechStackDTO): Promise<TechStack> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("tech_stacks")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error("Failed to update tech stack: " + error.message);
        return data;
    }

    async deleteTechStack(id: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from("tech_stacks")
            .delete()
            .eq("id", id);

        if (error) throw new Error("Failed to delete tech stack: " + error.message);
    }
}
