"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { TechStack } from "@/modules/techstack/techstack.types";
import { TECHSTACK_CATEGORIES, DEVICON_EXAMPLES } from "@/modules/techstack/techstack.types";
import { createTechStackAction, updateTechStackAction } from "@/app/admin/actions";

interface TechStackFormProps {
    initialData?: TechStack | null;
    isEditing?: boolean;
}

// Preset colors for quick selection
const PRESET_COLORS = [
    "#61DAFB", // React blue
    "#3178C6", // TypeScript blue
    "#339933", // Node.js green
    "#4169E1", // Royal blue
    "#E535AB", // GraphQL pink
    "#F7DF1E", // JavaScript yellow
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#95E1D3", // Mint
    "#FF8C42", // Orange
    "#9B59B6", // Purple
    "#2ECC71", // Green
    "#E74C3C", // Red
    "#3498DB", // Blue
    "#1ABC9C", // Turquoise
    "#F39C12", // Orange
    "#FFFFFF", // White
    "#000000", // Black
];

// Devicon preview component with color
function DeviconPreview({ iconClass, color }: { iconClass: string; color: string }) {
    if (!iconClass) return null;
    
    return (
        <div className="mt-3 flex items-center gap-3">
            <span className="text-zinc-400 text-sm">Preview:</span>
            <i className={`${iconClass} text-4xl`} style={{ color }}></i>
            <code className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">{iconClass}</code>
        </div>
    );
}

export function TechStackForm({ initialData, isEditing = false }: TechStackFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        icon_class: initialData?.icon_class || "",
        color: initialData?.color || "#61DAFB",
        category: initialData?.category || "Frontend",
        display_order: initialData?.display_order || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "display_order" ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
            };
            
            let result;
            if (isEditing && initialData) {
                result = await updateTechStackAction(initialData.id, payload);
            } else {
                result = await createTechStackAction(payload);
            }
            
            if (result.success) {
                toast.success(isEditing ? "Tech stack updated successfully" : "Tech stack created successfully");
                router.push("/admin/techstack");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to save tech stack");
            }
        } catch (error) {
            toast.error("Failed to save tech stack: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-zinc-400 mb-2 text-sm">Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. React, Node.js, PostgreSQL"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>

                <div>
                    <label className="block text-zinc-400 mb-2 text-sm">Category *</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        {TECHSTACK_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Color Selection */}
            <div>
                <label className="block text-zinc-400 mb-3 text-sm">Brand Color</label>
                
                {/* Color Presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {PRESET_COLORS.map((presetColor) => (
                        <button
                            key={presetColor}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, color: presetColor }))}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                formData.color === presetColor 
                                    ? "border-white scale-110" 
                                    : "border-zinc-700 hover:border-zinc-500"
                            }`}
                            style={{ backgroundColor: presetColor }}
                            title={presetColor}
                        />
                    ))}
                </div>
                
                {/* Custom Color Input */}
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="w-12 h-10 rounded-lg cursor-pointer bg-transparent"
                    />
                    <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="#61DAFB"
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>
                <p className="text-zinc-500 text-xs mt-2">
                    Choose a brand color for this technology. This will be used for accent styling.
                </p>
            </div>

            <div>
                <label className="block text-zinc-400 mb-2 text-sm">
                    Devicon Class *
                    <a 
                        href="https://devicon.dev/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-indigo-400 hover:text-indigo-300 text-xs"
                    >
                        Browse Icons →
                    </a>
                </label>
                <input
                    type="text"
                    name="icon_class"
                    value={formData.icon_class}
                    onChange={handleChange}
                    required
                    placeholder="e.g. devicon-react-original colored"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <DeviconPreview iconClass={formData.icon_class} color={formData.color} />
                <p className="text-zinc-500 text-xs mt-2">
                    Enter the full devicon class. Format: <code>devicon-[name]-[variant] [colored]</code>. 
                    Examples: <code>devicon-react-original colored</code>, <code>devicon-nodejs-plain</code>
                </p>
            </div>

            {/* Quick Select Examples */}
            <div>
                <label className="block text-zinc-400 mb-2 text-sm">Quick Select (click to use)</label>
                <div className="flex flex-wrap gap-2">
                    {DEVICON_EXAMPLES.map((example) => (
                        <button
                            key={example.class}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, icon_class: example.class }))}
                            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-indigo-500/50 transition-all"
                        >
                            <i className={`${example.class} text-xl`}></i>
                            <span className="text-xs text-zinc-400">{example.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-zinc-400 mb-2 text-sm">Display Order</label>
                <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleChange}
                    min={0}
                    placeholder="0"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <p className="text-zinc-500 text-xs mt-1">Lower numbers appear first.</p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button
                    type="button"
                    onClick={() => router.push("/admin/techstack")}
                    className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                >
                    {loading ? "Saving..." : isEditing ? "Update Tech Stack" : "Create Tech Stack"}
                </button>
            </div>
        </form>
    );
}
