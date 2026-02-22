export interface Profile {
    id: string;
    full_name: string;
    headline: string;
    bio: string;
    avatar_url: string;
    github_url: string;
    linkedin_url: string;
    twitter_url: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export type UpdateProfileDTO = Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
