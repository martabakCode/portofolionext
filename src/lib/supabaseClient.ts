import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser-side usage (Client Components).
 * This client runs in the browser and uses cookies automatically.
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
