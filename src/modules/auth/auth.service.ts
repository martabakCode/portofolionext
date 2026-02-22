import { AuthRepository } from "./auth.repository";
import { ADMIN_USER_ID } from "@/lib/constants";
import type { AdminSession } from "./auth.types";

/**
 * Service layer for auth business logic.
 * Validates admin identity — no direct Supabase calls.
 */
export class AuthService {
    private readonly repo: AuthRepository;

    constructor() {
        this.repo = new AuthRepository();
    }

    /**
     * Validates that the current user is the admin.
     * Throws if no session or if the user ID doesn't match ADMIN_USER_ID.
     *
     * @returns AdminSession — guaranteed valid session + user
     */
    async validateAdmin(): Promise<AdminSession> {
        const session = await this.repo.getSession();

        if (!session) {
            throw new Error("Unauthorized: No active session");
        }

        if (session.user.id !== ADMIN_USER_ID) {
            throw new Error("Forbidden: User is not admin");
        }

        return {
            session,
            user: session.user,
        };
    }

    /**
     * Gets the current session without admin validation.
     * Useful for checking if any user is logged in.
     */
    async getCurrentSession() {
        return this.repo.getSession();
    }

    /**
     * Signs out the current user.
     */
    async signOut(): Promise<void> {
        return this.repo.signOut();
    }
}
