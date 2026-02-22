import { createClient } from "@/lib/supabaseServer";
import type { LoginCredentials, AuthResult } from "./auth.types";
import type { Session } from "@supabase/supabase-js";

/**
 * Repository layer for all Supabase Auth operations.
 * No business logic here — just data access.
 */
export class AuthRepository {
    /**
     * Retrieves the current user session from Supabase.
     */
    async getSession(): Promise<Session | null> {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error("[AuthRepository] getSession error:", error.message);
            return null;
        }

        return data.session;
    }

    /**
     * Retrieves the current authenticated user from Supabase.
     * Uses getUser() which validates the JWT against the Supabase backend,
     * making it more secure than getSession() alone.
     */
    async getUser() {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            console.error("[AuthRepository] getUser error:", error.message);
            return null;
        }

        return data.user;
    }

    /**
     * Signs in a user with email and password.
     */
    async signIn(credentials: LoginCredentials): Promise<AuthResult> {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        return {
            session: data.session,
            user: data.user,
            error: error,
        };
    }

    /**
     * Signs out the current user.
     */
    async signOut(): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("[AuthRepository] signOut error:", error.message);
            throw new Error("Failed to sign out");
        }
    }
}
