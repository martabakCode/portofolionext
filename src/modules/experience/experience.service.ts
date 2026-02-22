import { ExperienceRepository } from "./experience.repository";
import type { CreateExperienceDTO, UpdateExperienceDTO } from "./experience.types";

export class ExperienceService {
    private repo = new ExperienceRepository();

    async getExperiences() {
        return this.repo.getExperiences();
    }

    async getExperienceById(id: string) {
        return this.repo.getExperienceById(id);
    }

    async createExperience(dto: CreateExperienceDTO) {
        return this.repo.createExperience(dto);
    }

    async updateExperience(id: string, dto: UpdateExperienceDTO) {
        return this.repo.updateExperience(id, dto);
    }

    async deleteExperience(id: string) {
        return this.repo.deleteExperience(id);
    }
}
