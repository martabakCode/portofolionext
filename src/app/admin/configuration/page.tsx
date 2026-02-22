
import { SiteService } from "@/modules/site/site.service";
import { SiteConfigForm } from "./components/SiteConfigForm";

export const dynamic = "force-dynamic";

export default async function ConfigurationPage() {
    const siteService = new SiteService();
    const siteConfig = await siteService.getSiteConfig();

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">App Configuration</h1>
                    <p className="text-zinc-400 mt-2">Customize your site&apos;s appearance, logo, and identity.</p>
                </header>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8">
                    <SiteConfigForm initialData={siteConfig} />
                </div>
            </div>
        </div>
    );
}
