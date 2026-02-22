import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ADMIN_USER_ID, ADMIN_ROUTE_PREFIX, ROUTES } from "./lib/constants";

/**
 * Middleware to protect admin routes.
 * Redirects unauthenticated or non-admin users to the login page.
 * Also refreshes the auth session on every request to prevent stale tokens.
 */
export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Middleware: Missing Supabase environment variables");
        return response;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session to keep the auth token alive
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isAdminRoute = request.nextUrl.pathname.startsWith(ADMIN_ROUTE_PREFIX);

    if (isAdminRoute) {
        // No user or not the admin → redirect to login
        if (!user || user.id !== ADMIN_USER_ID) {
            const loginUrl = new URL(ROUTES.LOGIN, request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return response;
}

/**
 * Matcher: run middleware on all routes except static files, images, and favicon.
 */
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
