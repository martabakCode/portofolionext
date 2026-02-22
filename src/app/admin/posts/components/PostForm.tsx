"use client";

import { useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface PostFormData {
    title: string;
    content: string;
    image_url: string;
    published: boolean;
}

interface PostFormProps {
    initialData?: PostFormData;
    onSubmit: (data: PostFormData) => Promise<{ success: boolean; error?: string }>;
    submitLabel: string;
}

export function PostForm({ initialData, onSubmit, submitLabel }: PostFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "**Hello world!!!**");
    const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
    const [published, setPublished] = useState(initialData?.published || false);
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
            const result = await onSubmit({ title, content, image_url: imageUrl, published });
            if (result.success) {
                toast.success(initialData ? "Post updated successfully" : "Post created successfully");
                router.push("/admin");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to save post");
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
                <label className="block text-zinc-400 mb-2 text-sm">Title</label>
                <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-custom/50"
                    placeholder="Enter post title..."
                />
            </div>

            {/* Content (MD Editor) */}
            <div data-color-mode="dark">
                <label className="block text-zinc-400 mb-2 text-sm">Content</label>
                <MDEditor
                    value={content}
                    onChange={(val) => setContent(val || "")}
                    height={500}
                    className="w-full rounded-xl border border-zinc-800 overflow-hidden"
                    preview="live"
                />
            </div>

            {/* Image Upload */}
            <ImageUpload
                bucket="posts"
                value={imageUrl}
                onChange={setImageUrl}
                label="Cover Image"
                placeholder="Upload post cover image"
                previewClassName="w-full h-64"
            />

            {/* Published */}
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="published"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-primary-custom focus:ring-primary-custom focus:ring-offset-zinc-950 cursor-pointer"
                />
                <label htmlFor="published" className="text-zinc-300 cursor-pointer select-none">
                    Publish immediately
                </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
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
