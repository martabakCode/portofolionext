import { TechStackForm } from "../components/TechStackForm";

export const metadata = {
    title: "Add Tech Stack - Admin",
};

export default function NewTechStackPage() {
    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Add Tech Stack</h1>
                    <p className="text-zinc-400 mt-2">Add a new technology or skill with a Material Icon.</p>
                </header>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8">
                    <TechStackForm />
                </div>
            </div>
        </div>
    );
}
