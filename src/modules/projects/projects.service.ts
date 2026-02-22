import { ProjectsRepository } from "./projects.repository";
import type { CreateProjectDTO, UpdateProjectDTO } from "./projects.types";

export class ProjectsService {
    private repo = new ProjectsRepository();

    async createProject(dto: CreateProjectDTO) {
        // Basic validation
        if (!dto.title || !dto.description) {
            throw new Error("Title and description are required.");
        }

        return this.repo.createProject(dto);
    }

    async getProjects() {
        return this.repo.getProjects();
    }

    async getProjectById(id: string) {
        return this.repo.getProjectById(id);
    }

    async updateProject(id: string, dto: UpdateProjectDTO) {
        return this.repo.updateProject(id, dto);
    }

    async deleteProject(id: string) {
        return this.repo.deleteProject(id);
    }
}
