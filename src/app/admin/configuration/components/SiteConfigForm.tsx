"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateSiteConfigAction } from "@/app/admin/actions";
import { SiteConfig } from "@/modules/site/site.types";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface SiteConfigFormProps {
    initialData: SiteConfig | null;
}

export function SiteConfigForm({ initialData }: SiteConfigFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({
        site_name: initialData?.site_name || "My Portfolio",
        site_description: initialData?.site_description || "",
        logo_text: initialData?.logo_text || "PORTFOLIO",
        logo_image: initialData?.logo_image || "",
        primary_color: initialData?.primary_color || "#4f46e5",
        secondary_color: initialData?.secondary_color || "#ec4899",
        accent_color: initialData?.accent_color || "#10b981",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await updateSiteConfigAction(formData);
            if (result.success) {
                toast.success("Site configuration updated successfully");
                router.push("/admin");
                router.refresh();
            } else {
                toast.error("Failed to update site config: " + result.error);
            }
        } catch (error) {
            toast.error("Failed to update site config: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
            {/* General Settings */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white border-b border-zinc-800 pb-2">General Settings</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-zinc-400 mb-2 text-sm">Site Name</label>
                        <input
                            type="text"
                            name="site_name"
                            value={formData.site_name}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-400 mb-2 text-sm">Logo Text</label>
                        <input
                            type="text"
                            name="logo_text"
                            value={formData.logo_text}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-zinc-400 mb-2 text-sm">Site Description</label>
                    <textarea
                        name="site_description"
                        rows={3}
                        value={formData.site_description}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                        placeholder="Brief description for SEO..."
                    />
                </div>
            </div>

            {/* Logo Image */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white border-b border-zinc-800 pb-2">Logo</h2>
                <ImageUpload
                    bucket="logos"
                    value={formData.logo_image}
                    onChange={(url) => setFormData({ ...formData, logo_image: url })}
                    label="Logo Image"
                    placeholder="Upload site logo"
                    previewClassName="w-48 h-48"
                />
            </div>

            {/* Appearance */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white border-b border-zinc-800 pb-2">Appearance</h2>

                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-zinc-400 mb-2 text-sm">Primary Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                name="primary_color"
                                value={formData.primary_color}
                                onChange={handleChange}
                                className="h-10 w-14 bg-zinc-900 border border-zinc-800 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                name="primary_color"
                                value={formData.primary_color}
                                onChange={handleChange}
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50 font-mono text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-zinc-400 mb-2 text-sm">Secondary Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                name="secondary_color"
                                value={formData.secondary_color}
                                onChange={handleChange}
                                className="h-10 w-14 bg-zinc-900 border border-zinc-800 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                name="secondary_color"
                                value={formData.secondary_color}
                                onChange={handleChange}
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50 font-mono text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-zinc-400 mb-2 text-sm">Accent Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                name="accent_color"
                                value={formData.accent_color}
                                onChange={handleChange}
                                className="h-10 w-14 bg-zinc-900 border border-zinc-800 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                name="accent_color"
                                value={formData.accent_color}
                                onChange={handleChange}
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50 font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Configuration"}
                </button>
            </div>
        </form>
    );
}
