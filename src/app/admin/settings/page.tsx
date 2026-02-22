import { ProfileService } from "@/modules/profile/profile.service";
import { SettingsForm } from "./components/SettingsForm";
import { createClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const service = new ProfileService();
    const profile = await service.getProfile();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Profile Settings</h1>
                    <p className="text-zinc-400 mt-2">Manage your public profile information and social links.</p>
                </header>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8">
                    <SettingsForm initialData={profile} />
                </div>

                <div className="mt-8 p-4 border border-zinc-800 rounded-xl bg-zinc-900/30">
                    <p className="text-zinc-500 text-xs font-mono">
                        Debug Info: <br />
                        User ID: <span className="text-zinc-300 select-all">{user?.id}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
