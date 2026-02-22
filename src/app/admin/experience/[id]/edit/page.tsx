import { ExperienceForm } from "../../components/ExperienceForm";
import { getExperienceAction } from "@/app/admin/actions";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({ params }: PageProps) {
    const { id } = await params;
    const { data: experience, success } = await getExperienceAction(id);

    if (!success || !experience) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Edit Experience</h1>
                    <p className="text-zinc-400 mt-2">Update this role&apos;s details.</p>
                </header>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8">
                    <ExperienceForm initialData={experience} />
                </div>
            </div>
        </div>
    );
}
