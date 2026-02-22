
export interface SiteConfig {
    id: string;
    site_name: string;
    site_description?: string;
    logo_text?: string;
    logo_image?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
}

export type UpdateSiteConfigDTO = Partial<Omit<SiteConfig, "id">>;
