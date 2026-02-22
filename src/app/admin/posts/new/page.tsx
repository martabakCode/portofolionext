"use client";

import { createPostAction } from "./actions";
import { PostForm } from "../components/PostForm";

export default function NewPostPage() {
    const handleCreate = async (data: { title: string; content: string; image_url: string; published: boolean }) => {
        return await createPostAction(data);
    };

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Write New Post</h1>
                <PostForm onSubmit={handleCreate} submitLabel="Create Post" />
            </div>
        </div>
    );
}
