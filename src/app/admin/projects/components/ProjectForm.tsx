"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Project } from "@/modules/projects/projects.types";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface ProjectFormProps {
    initialData?: Partial<Project>;
    onSubmit: (data: FormData) => Promise<{ success: boolean; error?: string }>;
    submitLabel?: string;
}

export function ProjectForm({ initialData, onSubmit, submitLabel = "Save Project" }: ProjectFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [link, setLink] = useState(initialData?.link || "");
    const [techStack, setTechStack] = useState(initialData?.tech_stack?.join(", ") || "");
    const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
            toast.error("Title is required");
            return;
        }
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("link", link);
            formData.append("tech_stack", techStack);
            formData.append("image_url", imageUrl);
            if (initialData?.id) {
                formData.append("id", initialData.id);
            }

            const result = await onSubmit(formData);
            
            if (result.success) {
                toast.success(initialData?.id ? "Project updated successfully" : "Project created successfully");
                router.push("/admin");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to save project");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-zinc-400 mb-2 text-sm">Project Title</label>
                <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                    placeholder="e.g. E-Commerce Platform"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-zinc-400 mb-2 text-sm">Description</label>
                <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                    placeholder="Brief description of the project..."
                />
            </div>

            {/* Link */}
            <div>
                <label className="block text-zinc-400 mb-2 text-sm">Project URL (Optional)</label>
                <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                    placeholder="https://..."
                />
            </div>

            {/* Tech Stack */}
            <div>
                <label className="block text-zinc-400 mb-2 text-sm">Tech Stack (comma separated)</label>
                <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                    placeholder="React, Node.js, Supabase, Tailwind"
                />
            </div>

            {/* Image Upload */}
            <ImageUpload
                bucket="projects"
                value={imageUrl}
                onChange={setImageUrl}
                label="Cover Image"
                placeholder="Upload project cover image"
                previewClassName="w-full h-64"
            />

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-custom to-secondary-custom text-white font-semibold hover:from-primary-custom/90 hover:to-secondary-custom/90 transition-all shadow-lg shadow-primary-custom/20 disabled:opacity-50"
                >
                    {loading ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
