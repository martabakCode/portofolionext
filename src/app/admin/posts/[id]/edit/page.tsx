import { PostsService } from "@/modules/posts/posts.service";
import { EditPostForm } from "./EditPostForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    console.log("[EditPostPage] Request for ID:", params.id);
    const service = new PostsService();
    const post = await service.getPostById(params.id);

    if (!post) {
        console.error("[EditPostPage] Post not found for ID:", params.id);
        notFound();
    }

    return <EditPostForm post={post} />;
}
