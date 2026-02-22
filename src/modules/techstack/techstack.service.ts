import { TechStackRepository } from "./techstack.repository";
import type { CreateTechStackDTO, UpdateTechStackDTO } from "./techstack.types";

export class TechStackService {
    private repo = new TechStackRepository();

    async getTechStacks() {
        return this.repo.getTechStacks();
    }

    async getTechStackById(id: string) {
        return this.repo.getTechStackById(id);
    }

    async getTechStacksByCategory(category: string) {
        return this.repo.getTechStacksByCategory(category);
    }

    async createTechStack(dto: CreateTechStackDTO) {
        return this.repo.createTechStack(dto);
    }

    async updateTechStack(id: string, dto: UpdateTechStackDTO) {
        return this.repo.updateTechStack(id, dto);
    }

    async deleteTechStack(id: string) {
        return this.repo.deleteTechStack(id);
    }
}
