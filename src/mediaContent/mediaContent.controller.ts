import { Body, Controller, Delete, Get, Param, Patch, Post, Query,  UploadedFile,  UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { MediaContentService } from "./mediaContent.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { rolEnum } from "src/users/users.entity";
import { MediaContent, MediaSection, MediaType } from "./mediaContent.entity";
import { CreateMediaContentDto } from "./dto/create-mediaContent.dto";
import { UpdateMediaContentDto } from "./dto/update-mediaContent.dto";
import { FileInterceptor } from "@nestjs/platform-express";




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
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                type: { type: 'string', enum: Object.values(MediaType) },
                section: { type: 'string', enum: Object.values(MediaSection) },
                altText: { type: 'string' },
                tag: { type: 'string' },
                title: { type: 'string' },
                subtitle: { type: 'string' },
                ctaText: { type: 'string' },
                ctaUrl: { type: 'string' },
                order: { type: 'number' }
            }
        }
    })
    @UseInterceptors(FileInterceptor('file'))
    async create(@UploadedFile() file: Express.Multer.File, @Body() createMediaContentdto: CreateMediaContentDto): Promise<MediaContent> {
        return await this.mediaContentService.create(createMediaContentdto, file);
    }

    
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'Opcional - nueva imagen' },
                type: { type: 'string', enum: Object.values(MediaType) },
                section: { type: 'string', enum: Object.values(MediaSection) },
                altText: { type: 'string' },
                tag: { type: 'string' },
                title: { type: 'string' },
                subtitle: { type: 'string' },
                ctaText: { type: 'string' },
                ctaUrl: { type: 'string' },
                order: { type: 'number' }
            }
        }
    })
    @UseInterceptors(FileInterceptor('file'))
    update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() updateMediaContentDto: UpdateMediaContentDto) {
        return this.mediaContentService.update(id, updateMediaContentDto, file);
    }

    @Patch(':id/toggle')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
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