import { ProfileRepository } from "./profile.repository";
import type { UpdateProfileDTO } from "./profile.types";

export class ProfileService {
    private repo = new ProfileRepository();

    async getProfile() {
        return this.repo.getProfile();
    }

    async updateProfile(dto: UpdateProfileDTO) {
        return this.repo.updateProfile(dto);
    }
}
