"use client";
import React from 'react';
import { createProjectAction } from "./actions";
import { ProjectForm } from "../components/ProjectForm";

export default function NewProjectPage() {
    const handleCreate = async (formData: FormData) => {
        const data = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            link: formData.get("link") as string,
            tech_stack: (formData.get("tech_stack") as string).split(",").map((s) => s.trim()).filter(Boolean),
            image_url: formData.get("image_url") as string,
        };
        return await createProjectAction(data);
    };

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Add New Project</h1>
                <ProjectForm onSubmit={handleCreate} />
            </div>
        </div>
    );
}
