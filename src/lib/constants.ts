/**
 * The unique Supabase user ID for the sole admin user.
 * Replace this with your actual admin user ID from Supabase Dashboard → Auth → Users.
 */
export const ADMIN_USER_ID = "9a3239b3-494d-4d61-9ee1-81e337cc0015";

/**
 * Route paths used across the application.
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  ADMIN_DASHBOARD: "/admin",
  AUTH_CALLBACK: "/auth/callback",
  BLOG: "/blog",
  PROJECTS: "/projects",
  ABOUT: "/about",
  ADMIN: {
    DASHBOARD: "/admin",
  },
} as const;

/**
 * Prefix for all admin-protected routes.
 */
export const ADMIN_ROUTE_PREFIX = "/admin";
