export interface Experience {
    id: string;
    company: string;
    role: string;
    description: string;
    start_date: string;
    end_date?: string;
    current: boolean;
    created_at: string;
    updated_at: string;
}

export type CreateExperienceDTO = Omit<Experience, "id" | "created_at" | "updated_at">;
export type UpdateExperienceDTO = Partial<CreateExperienceDTO>;
