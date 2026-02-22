export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string; // Markdown or HTML
    image_url: string | null;
    published: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreatePostDTO {
    title: string;
    content: string;
    image_url?: string;
    published?: boolean;
}

export interface UpdatePostDTO extends Partial<CreatePostDTO> { }
