"use client";
import { updatePostAction } from "@/app/admin/actions";
import { PostForm } from "../../components/PostForm";
import { Post } from "@/modules/posts/posts.types";

interface EditPostFormProps {
    post: Post;
}

export function EditPostForm({ post }: EditPostFormProps) {
    const handleUpdate = async (data: { title: string; content: string; image_url: string; published: boolean }) => {
        return await updatePostAction(post.id, data);
    };

    return (
        <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Edit Post: {post.title}</h1>
                <PostForm
                    initialData={{
                        title: post.title,
                        content: post.content,
                        image_url: post.image_url || "",
                        published: post.published,
                    }}
                    onSubmit={handleUpdate}
                    submitLabel="Update Post"
                />
            </div>
        </div>
    );
}
