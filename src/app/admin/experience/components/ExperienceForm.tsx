"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createExperienceAction, updateExperienceAction } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import type { Experience } from "@/modules/experience/experience.types";

interface ExperienceFormProps {
    initialData?: Experience | null;
}

export function ExperienceForm({ initialData }: ExperienceFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({
        company: initialData?.company || "",
        role: initialData?.role || "",
        description: initialData?.description || "",
        start_date: initialData?.start_date || "",
        end_date: initialData?.end_date || "",
        current: initialData?.current || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            end_date: formData.current ? undefined : (formData.end_date || undefined),
        };

        try {
            let result;
            if (initialData?.id) {
                result = await updateExperienceAction(initialData.id, payload);
            } else {
                result = await createExperienceAction(payload);
            }

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(initialData ? "Experience updated successfully" : "Experience created successfully");
            router.push("/admin");
            router.refresh();
        } catch (error) {
            toast.error("Failed to save experience: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-zinc-400 mb-2 text-sm">Company</label>
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                        placeholder="e.g. Google"
                    />
                </div>
                <div>
                    <label className="block text-zinc-400 mb-2 text-sm">Role</label>
                    <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                        placeholder="e.g. Senior Software Engineer"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-zinc-400 mb-2 text-sm">Start Date</label>
                    <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                    />
                </div>
                <div>
                    <label className="block text-zinc-400 mb-2 text-sm">End Date</label>
                    <input
                        type="date"
                        name="end_date"
                        value={formData.end_date || ""}
                        onChange={handleChange}
                        disabled={formData.current}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50 disabled:opacity-50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="current"
                    name="current"
                    checked={formData.current}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-primary-custom focus:ring-primary-custom focus:ring-offset-zinc-950"
                />
                <label htmlFor="current" className="text-zinc-400 text-sm select-none">
                    I currently work here
                </label>
            </div>

            <div>
                <label className="block text-zinc-400 mb-2 text-sm">Description</label>
                <textarea
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                    placeholder="Describe your responsibilities and achievements..."
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-primary-custom to-secondary-custom text-white font-semibold hover:from-primary-custom/90 hover:to-secondary-custom/90 transition-all shadow-lg shadow-primary-custom/20 disabled:opacity-50"
                >
                    {loading ? "Saving..." : (initialData ? "Update Experience" : "Add Experience")}
                </button>
            </div>
        </form>
    );
}
