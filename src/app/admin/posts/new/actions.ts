"use server";

import { PostsService } from "@/modules/posts/posts.service";
import { CreatePostDTO } from "@/modules/posts/posts.types";
import { revalidatePath } from "next/cache";

const postsService = new PostsService();

export async function createPostAction(dto: CreatePostDTO) {
    try {
        await postsService.createPost(dto);
        revalidatePath("/admin");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
