import { Body, Controller, Delete, Get, Param, Patch, Post, Query,  UseGuards } from "@nestjs/common";
import { ApiBody, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { MediaContentService } from "./mediaContent.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { rolEnum } from "src/users/users.entity";
import { MediaContent, MediaType } from "./mediaContent.entity";
import { CreateMediaContentDto } from "./dto/create-mediaContent.dto";
import { UpdateMediaContentDto } from "./dto/update-mediaContent.dto";




@ApiTags('MediaContent')
@Controller("media_content")
export class MediaContentController {
    constructor(
        private readonly mediaContentService: MediaContentService,
    ) { }

    @Get()
    findAll() {
        return this.mediaContentService.findAll();
    }

    @Get('by-type')
    findByType(@Query('type') type: MediaType) {
        return this.mediaContentService.findByType(type);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.mediaContentService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiBody({ type: CreateMediaContentDto })
    async create(@Body() createMediaContentdto: CreateMediaContentDto): Promise<MediaContent> {
        return await this.mediaContentService.create(createMediaContentdto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMediaContentDto: UpdateMediaContentDto) {
        return this.mediaContentService.update(id, updateMediaContentDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @Patch(':id/toggle')
    toggleActive(@Param('id') id: string) {
        return this.mediaContentService.toggleActive(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.mediaContentService.remove(id);
    }

}