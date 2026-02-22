
import { SiteRepository } from "./site.repository";
import { SiteConfig, UpdateSiteConfigDTO } from "./site.types";

export class SiteService {
    private repo = new SiteRepository();

    async getSiteConfig(): Promise<SiteConfig | null> {
        return this.repo.getSiteConfig();
    }

    async updateSiteConfig(payload: UpdateSiteConfigDTO): Promise<SiteConfig> {
        return this.repo.updateSiteConfig(payload);
    }
}
