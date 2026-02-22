"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "@/app/admin/actions";
import type { Profile } from "@/modules/profile/profile.types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface SettingsFormProps {
    initialData: Profile | null;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: initialData?.full_name || "",
        headline: initialData?.headline || "",
        bio: initialData?.bio || "",
        avatar_url: initialData?.avatar_url || "",
        github_url: initialData?.github_url || "",
        linkedin_url: initialData?.linkedin_url || "",
        twitter_url: initialData?.twitter_url || "",
        email: initialData?.email || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await updateProfileAction(formData);
            if (result.success) {
                toast.success("Profile updated successfully");
                router.refresh();
            } else {
                toast.error("Failed to update profile: " + result.error);
            }
        } catch (error) {
            toast.error("Failed to update profile: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
            {/* Personal Info */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white border-b border-zinc-800 pb-2">Personal Info</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-zinc-400 mb-2 text-sm">Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-400 mb-2 text-sm">Headline / Title</label>
                        <input
                            type="text"
                            name="headline"
                            value={formData.headline}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="e.g. Fullstack Engineer"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-zinc-400 mb-2 text-sm">Bio</label>
                    <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>

                {/* Avatar Upload */}
                <ImageUpload
                    bucket="avatars"
                    value={formData.avatar_url}
                    onChange={(url) => setFormData({ ...formData, avatar_url: url })}
                    label="Avatar Image"
                    placeholder="Upload profile avatar"
                    previewClassName="w-40 h-40 rounded-full"
                />
            </div>

            {/* Tech Stack Section - Link to separate page */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h2 className="text-xl font-semibold text-white">Tech Stack</h2>
                    <Link 
                        href="/admin/techstack" 
                        className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                        Manage Tech Stack →
                    </Link>
                </div>
                <p className="text-zinc-500 text-sm">
                    Tech Stack is now managed separately. Click the link above to add, edit, or remove technologies with Material Icons.
                </p>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white border-b border-zinc-800 pb-2">Social & Contact</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-zinc-400 mb-2 text-sm">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-400 mb-2 text-sm">GitHub URL</label>
                        <input
                            type="url"
                            name="github_url"
                            value={formData.github_url}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-400 mb-2 text-sm">LinkedIn URL</label>
                        <input
                            type="url"
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-400 mb-2 text-sm">Twitter/X URL</label>
                        <input
                            type="url"
                            name="twitter_url"
                            value={formData.twitter_url}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form >
    );
}
