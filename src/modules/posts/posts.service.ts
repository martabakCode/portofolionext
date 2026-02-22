import { PostsRepository } from "./posts.repository";
import type { CreatePostDTO, Post, UpdatePostDTO } from "./posts.types";

export class PostsService {
    private repo = new PostsRepository();

    /**
     * Creates a new blog post.
     * Auto-generates a URL-friendly slug from the title.
     */
    async createPost(dto: CreatePostDTO): Promise<Post> {
        const slug = this.generateSlug(dto.title);

        // Check for duplicate slug
        const existing = await this.repo.getPostBySlug(slug);
        if (existing) {
            throw new Error("A post with this title already exists.");
        }

        return this.repo.createPost({ ...dto, slug });
    }

    async getPosts(publishedOnly = true) {
        return this.repo.getPosts(publishedOnly);
    }

    async getPostBySlug(slug: string) {
        return this.repo.getPostBySlug(slug);
    }

    async getPostById(id: string) {
        return this.repo.getPostById(id);
    }

    async updatePost(id: string, dto: UpdatePostDTO) {
        return this.repo.updatePost(id, dto);
    }

    async deletePost(id: string) {
        return this.repo.deletePost(id);
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
}
