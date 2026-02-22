export interface TechStack {
    id: string;
    name: string;
    icon_class: string;
    color: string;
    category: string;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export type CreateTechStackDTO = Omit<TechStack, "id" | "created_at" | "updated_at">;
export type UpdateTechStackDTO = Partial<CreateTechStackDTO>;

// Common categories for tech stacks
export const TECHSTACK_CATEGORIES = [
    "Frontend",
    "Backend",
    "Database",
    "DevOps",
    "Mobile",
    "Tools",
    "Language",
    "Framework",
    "Library",
    "Other"
] as const;

// Common Devicon class examples for reference
export const DEVICON_EXAMPLES = [
    { name: "React", class: "devicon-react-original colored" },
    { name: "Next.js", class: "devicon-nextjs-original" },
    { name: "TypeScript", class: "devicon-typescript-plain colored" },
    { name: "JavaScript", class: "devicon-javascript-plain colored" },
    { name: "Node.js", class: "devicon-nodejs-plain colored" },
    { name: "PostgreSQL", class: "devicon-postgresql-plain colored" },
    { name: "MongoDB", class: "devicon-mongodb-plain colored" },
    { name: "Tailwind CSS", class: "devicon-tailwindcss-original colored" },
    { name: "Python", class: "devicon-python-plain colored" },
    { name: "Go", class: "devicon-go-original-wordmark colored" },
    { name: "Rust", class: "devicon-rust-plain" },
    { name: "Docker", class: "devicon-docker-plain colored" },
    { name: "Git", class: "devicon-git-plain colored" },
    { name: "GitHub", class: "devicon-github-original" },
    { name: "VS Code", class: "devicon-vscode-plain colored" },
    { name: "Figma", class: "devicon-figma-plain colored" },
] as const;
