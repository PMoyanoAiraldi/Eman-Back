import { Controller, Post, Patch, Delete, Param, Query, UploadedFile, UseInterceptors, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBody, ApiConsumes, ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { rolEnum } from 'src/users/users.entity';
import { MediaType } from 'src/mediaContent/mediaContent.entity';

type EntityType = 'product' | 'media';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(rolEnum.ADMIN)
@ApiSecurity('bearer')
@Controller('file-upload')
export class FileUploadController {
    constructor(private readonly fileUploadService: FileUploadService) {}


    @ApiQuery({ name: 'entityType', required: true, enum: ['product', 'media'] })
    @ApiQuery({ name: 'entityId', required: false, description: 'Requerido solo para actualizar' })
    @ApiQuery({ name: 'mediaType', required: false, enum: MediaType })
    @Post()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
    schema: {
        type: 'object',
        properties: {
            file: {
                type: 'string',
                format: 'binary',
                description: 'Imagen a subir'
            }
        }
        }
    })
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('entityType') entityType: EntityType,
        @Query('entityId') entityId?: string,
        @Query('mediaType') mediaType?: MediaType,
    ) {
        if (!file) throw new BadRequestException('No se proporcionó ningún archivo');
        if (!entityType) throw new BadRequestException('No se proporcionó el tipo de entidad');

        return this.fileUploadService.uploadFile(file, entityType, entityId, mediaType);
    }

    @Patch('images/:imageId')
    @UseInterceptors(FileInterceptor('file'))
    async replaceImage(
        @UploadedFile() file: Express.Multer.File,
        @Param('imageId') imageId: string,
    ) {
        if (!file) throw new BadRequestException('No se proporcionó ningún archivo');

        return this.fileUploadService.replaceImage(file, imageId);
    }

    @Delete(':publicId')
    async deleteFile(@Param('publicId') publicId: string) {
        return this.fileUploadService.deleteFile(publicId);
    }
}