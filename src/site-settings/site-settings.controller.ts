import { Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { SiteSettingsService } from "./site-settings.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { rolEnum } from "src/users/users.entity";

@Controller('settings')
export class SiteSettingsController {
    constructor(private readonly service: SiteSettingsService) {}

    @Get('maintenance')
    getMaintenance() {
        return this.service.getStatus();
    }

    @Patch('maintenance')
    @UseGuards(JwtAuthGuard, RolesGuard) // los que ya tenés para admin
    @Roles(rolEnum.ADMIN)
    toggleMaintenance() {
        return this.service.toggle();
    }
}