import { TechStackService } from "@/modules/techstack/techstack.service";
import Link from "next/link";
import { DeleteButton } from "./components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function TechStackPage() {
    const service = new TechStackService();
    const techStacks = await service.getTechStacks();

    // Group by category
    const grouped = techStacks.reduce((acc, tech) => {
        if (!acc[tech.category]) acc[tech.category] = [];
        acc[tech.category].push(tech);
        return acc;
    }, {} as Record<string, typeof techStacks>);

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Tech Stack</h1>
                        <p className="text-zinc-400 mt-2">Manage your skills and technologies with Devicon.</p>
                    </div>
                    <Link
                        href="/admin/techstack/new"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-900/20"
                    >
                        + Add Tech Stack
                    </Link>
                </header>

                {techStacks.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
                        <i className="devicon-devicon-plain text-5xl text-zinc-600 mb-4"></i>
                        <h3 className="text-xl font-semibold text-white mb-2">No Tech Stacks Yet</h3>
                        <p className="text-zinc-400 mb-6">Add your first technology or skill.</p>
                        <Link
                            href="/admin/techstack/new"
                            className="inline-block px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all"
                        >
                            Add Tech Stack
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([category, items]) => (
                            <div key={category} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    {category}
                                    <span className="text-zinc-500 text-sm font-normal">({items.length})</span>
                                </h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {items.map(tech => (
                                        <div
                                            key={tech.id}
                                            className="group bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all"
                                            style={{ 
                                                borderLeftWidth: "4px",
                                                borderLeftColor: tech.color || "#6366f1"
                                            }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                                                        style={{ backgroundColor: `${tech.color}15` }}
                                                    >
                                                        <i 
                                                            className={`${tech.icon_class} text-2xl`}
                                                            style={{ color: tech.color }}
                                                        ></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-white">{tech.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span 
                                                                className="w-2 h-2 rounded-full"
                                                                style={{ backgroundColor: tech.color }}
                                                            ></span>
                                                            <span className="text-xs text-zinc-500">Order: {tech.display_order}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-zinc-800">
                                                <Link
                                                    href={`/admin/techstack/${tech.id}/edit`}
                                                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                                                >
                                                    Edit
                                                </Link>
                                                <DeleteButton id={tech.id} techName={tech.name} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Devicon Info */}
                <div className="mt-8 p-4 border border-zinc-800 rounded-xl bg-zinc-900/30">
                    <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                        <i className="devicon-devicon-plain text-lg text-indigo-400"></i>
                        About Devicon
                    </h4>
                    <p className="text-zinc-500 text-sm">
                        This section uses Devicon for technology icons. Visit{" "}
                        <a 
                            href="https://devicon.dev/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300"
                        >
                            devicon.dev
                        </a>{" "}
                        to browse available icons. Each tech stack has its own brand color for visual consistency.
                    </p>
                </div>
            </div>
        </div>
    );
}
