import { TechStackService } from "@/modules/techstack/techstack.service";
import { TechStackForm } from "../../components/TechStackForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditTechStackPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditTechStackPage({ params }: EditTechStackPageProps) {
    const { id } = await params;
    const service = new TechStackService();
    const techStack = await service.getTechStackById(id);

    if (!techStack) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Edit Tech Stack</h1>
                    <p className="text-zinc-400 mt-2">Update {techStack.name} details.</p>
                </header>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8">
                    <TechStackForm initialData={techStack} isEditing />
                </div>
            </div>
        </div>
    );
}
