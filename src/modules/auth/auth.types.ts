import type { Session, User, AuthError } from "@supabase/supabase-js";

/**
 * Credentials required for email/password sign-in.
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Result of a sign-in attempt.
 */
export interface AuthResult {
    session: Session | null;
    user: User | null;
    error: AuthError | null;
}

/**
 * Validated admin session — guaranteed to have a valid session and user.
 */
export interface AdminSession {
    session: Session;
    user: User;
}
