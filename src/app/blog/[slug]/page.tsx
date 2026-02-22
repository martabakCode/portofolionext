
import { PostsService } from "@/modules/posts/posts.service";
import { notFound } from "next/navigation";
import ClientBlogWrapper from "./ClientBlogWrapper";

export const dynamic = "force-dynamic";

interface BlogPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
    const { slug } = await params;
    const postsService = new PostsService();
    const post = await postsService.getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return <ClientBlogWrapper post={post} />;
}
