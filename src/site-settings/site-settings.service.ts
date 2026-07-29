import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SiteSettings } from "./site-settings.entity";
import { Repository } from "typeorm";

@Injectable()
export class SiteSettingsService {
    constructor(
        @InjectRepository(SiteSettings)
            private readonly siteSettingsRepository: Repository<SiteSettings>,
        ) { }

private async getOrCreateSettings(): Promise<SiteSettings> {
    let settings = await this.siteSettingsRepository.findOne({ where: { id: 1 } });
    if (!settings) {
        settings = this.siteSettingsRepository.create({ id: 1, maintenanceMode: false });
        await this.siteSettingsRepository.save(settings);
        }
        return settings;
    }

async getStatus(): Promise<{ maintenanceMode: boolean }> {
    const { maintenanceMode } = await this.getOrCreateSettings();
    return { maintenanceMode };
}

async toggle(): Promise<{ maintenanceMode: boolean }> {
    const settings = await this.getOrCreateSettings();
    settings.maintenanceMode = !settings.maintenanceMode;
    await this.siteSettingsRepository.save(settings);
    return { maintenanceMode: settings.maintenanceMode };
    }
}