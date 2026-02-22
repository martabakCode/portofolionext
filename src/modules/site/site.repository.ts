
import { createClient } from "@/lib/supabaseServer";
import { SiteConfig, UpdateSiteConfigDTO } from "./site.types";

export class SiteRepository {

    async getSiteConfig(): Promise<SiteConfig | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("site_config")
            .select("*")
            .single();

        if (error) {
            console.error("Error fetching site config:", error);
            return null;
        }

        return data as SiteConfig;
    }

    async updateSiteConfig(payload: UpdateSiteConfigDTO): Promise<SiteConfig> {
        const supabase = await createClient();
        // Try to update existing config first
        const { data: existing } = await supabase
            .from("site_config")
            .select("id")
            .single();

        if (existing) {
            const { data, error } = await supabase
                .from("site_config")
                .update({
                    ...payload,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as SiteConfig;
        } else {
            // Create if not exists (though setup-db should handle this)
            const { data, error } = await supabase
                .from("site_config")
                .insert([payload])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data as SiteConfig;
        }
    }
}
