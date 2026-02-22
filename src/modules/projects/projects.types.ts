export interface Project {
    id: string;
    title: string;
    description: string;
    link: string | null;
    tech_stack: string[];
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateProjectDTO {
    title: string;
    description: string;
    link?: string;
    tech_stack: string[];
    image_url?: string;
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> { }
