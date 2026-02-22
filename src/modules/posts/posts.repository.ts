import { createClient } from "@/lib/supabaseServer";
import type { Post, CreatePostDTO, UpdatePostDTO } from "./posts.types";

export class PostsRepository {
    async createPost(post: CreatePostDTO & { slug: string }): Promise<Post> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("posts")
            .insert(post)
            .select()
            .single();

        if (error) {
            console.error("[PostsRepo] Create error:", error);
            throw new Error("Failed to create post");
        }

        return data;
    }

    async getPosts(publishedOnly = true): Promise<Post[]> {
        const supabase = await createClient();
        let query = supabase.from("posts").select("*").order("created_at", { ascending: false });

        if (publishedOnly) {
            query = query.eq("published", true);
        }

        const { data, error } = await query;

        if (error) {
            console.error("[PostsRepo] GetPosts error:", error);
            return [];
        }

        return data;
    }

    async getPostBySlug(slug: string): Promise<Post | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("slug", slug)
            .single();

        if (error) return null;
        return data;
    }

    async getPostById(id: string): Promise<Post | null> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("id", id)
            .single();

        if (error) return null;
        return data;
    }

    async updatePost(id: string, updates: UpdatePostDTO): Promise<Post> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("posts")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error("Failed to update post");
        return data;
    }

    async deletePost(id: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase.from("posts").delete().eq("id", id);
        if (error) throw new Error("Failed to delete post");
    }
}
