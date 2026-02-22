import { createClient } from "@/lib/supabaseServer";
import type { Profile, UpdateProfileDTO } from "./profile.types";

export class ProfileRepository {
    async getProfile(): Promise<Profile | null> {
        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .limit(1)
                .single();

            if (error) {
                // Check if table doesn't exist
                if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) {
                    console.error("Profiles table not found. Please run the database setup SQL in Supabase Dashboard.");
                }
                return null;
            }
            return data;
        } catch (e) {
            console.error("Error fetching profile:", e);
            return null;
        }
    }

    async updateProfile(updates: UpdateProfileDTO): Promise<Profile> {
        const supabase = await createClient();

        try {
            // Check if profile exists
            const { data: existing, error: checkError } = await supabase
                .from("profiles")
                .select("id")
                .limit(1)
                .single();

            if (checkError) {
                if (checkError.message?.includes("does not exist") || checkError.message?.includes("schema cache")) {
                    throw new Error(
                        "Database table 'profiles' not found. " +
                        "Please run the SQL setup in Supabase Dashboard first (npm run seed:db)"
                    );
                }
            }

            if (!existing) {
                // Create new if not exists
                const { data, error } = await supabase
                    .from("profiles")
                    .insert(updates)
                    .select()
                    .single();
                
                if (error) {
                    if (error.message?.includes("does not exist") || error.message?.includes("schema cache")) {
                        throw new Error(
                            "Database table 'profiles' not found. " +
                            "Please run the SQL setup in Supabase Dashboard first (npm run seed:db)"
                        );
                    }
                    throw new Error("Failed to create profile: " + error.message);
                }
                return data;
            }

            const { data, error } = await supabase
                .from("profiles")
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq("id", existing.id)
                .select()
                .single();

            if (error) {
                throw new Error("Failed to update profile: " + error.message);
            }
            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Unknown error occurred while updating profile");
        }
    }
}
