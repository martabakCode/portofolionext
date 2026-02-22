import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ROUTES } from "@/lib/constants";

/**
 * Auth callback route handler.
 * Exchanges the auth code for a session and redirects to admin.
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? ROUTES.ADMIN_DASHBOARD;

    if (!code) {
        return NextResponse.redirect(new URL(ROUTES.LOGIN, origin));
    }

    const response = NextResponse.redirect(new URL(next, origin));

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("[AuthCallback] Code exchange error:", error.message);
        return NextResponse.redirect(new URL(ROUTES.LOGIN, origin));
    }

    return response;
}
