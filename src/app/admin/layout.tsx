import { redirect } from "next/navigation";
import { AuthService } from "@/modules/auth/auth.service";
import { ROUTES } from "@/lib/constants";

/**
 * Admin layout: validates admin session server-side.
 * Redirects to login if session is invalid or user is not admin.
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const authService = new AuthService();

    try {
        await authService.validateAdmin();
    } catch {
        redirect(ROUTES.LOGIN);
    }

    return <>{children}</>;
}
