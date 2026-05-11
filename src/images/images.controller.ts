import { Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ImagesService } from "./images.service";
import { Images } from "./images.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { rolEnum } from "src/users/users.entity";
import { FileInterceptor } from "@nestjs/platform-express";

@ApiTags('Images')
@Controller("images")
export class ImagesController {
    constructor(
        private readonly imagesService: ImagesService,
    ) { }

    @Get(':productId')
    @ApiOperation({ summary: 'Obtener todas las imágenes de un producto' })
    async getImages(@Param('productId') productId: string): Promise<Images[]> {
        return this.imagesService.getImagesByProduct(productId);
    }

    @Post(':productId')
    @ApiOperation({ summary: 'Agregar imagen a un producto - Solo Admin' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' }
            }
        }
    })
    @UseInterceptors(FileInterceptor('file'))
    async addImage(
        @Param('productId') productId: string,
        @UploadedFile() file: Express.Multer.File
    ): Promise<Images> {
        return this.imagesService.addImage(productId, file);
    }

    @Patch(':imageId/replace')
    @ApiOperation({ summary: 'Reemplazar una imagen - Solo Admin' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' }
            }
        }
    })
    @UseInterceptors(FileInterceptor('file'))
    async replaceImage(
        @Param('imageId') imageId: string,
        @UploadedFile() file: Express.Multer.File
    ): Promise<{ imgUrl: string }> {
        return this.imagesService.replaceImage(file, imageId);
    }

    @Patch(':imageId/primary')
    @ApiOperation({ summary: 'Marcar imagen como primaria - Solo Admin' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async setPrimary(@Param('imageId') imageId: string): Promise<Images> {
        return this.imagesService.setPrimary(imageId);
    }

    @Delete(':imageId')
    @ApiOperation({ summary: 'Eliminar una imagen - Solo Admin' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async deleteImage(@Param('imageId') imageId: string): Promise<void> {
        return this.imagesService.deleteImage(imageId);
    }

    
}