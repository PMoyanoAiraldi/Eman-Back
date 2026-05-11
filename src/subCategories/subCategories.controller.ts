import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { SubCategoriesService } from "./subCategories.service";
import { FileUploadService } from "src/file-upload/file-upload.service";
import { CloudinaryService } from "src/file-upload/cloudinary.service";
import { ResponseSubCategoryDto } from "./dto/response-subcategory.dto";
import { CreateSubCategoryDto } from "./dto/create-subcategory.dto";
import { SubCategories } from "./subCategories.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { rolEnum } from "src/users/users.entity";
import { UpdateSubCategoryDto } from "./dto/update-subcategory.dto";
import { UpdateSubCategoryStateDto } from "./dto/update-subcategoryState.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@ApiTags('SubCategories')
@Controller("sub_categories")
export class SubCategoriesController {
    constructor(
        private readonly subCategoriesService: SubCategoriesService,
        private readonly fileUploadService: FileUploadService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

        @Post()
        @ApiOperation({ summary: 'Crear una nueva subcategoría' })
        @ApiResponse({ status: 201, description: 'Subcategoría creada', type: ResponseSubCategoryDto })
        @ApiResponse({ status: 400, description: 'La subcategoría ya existe.' })
        @HttpCode(HttpStatus.CREATED)
        @ApiSecurity('bearer')
        @ApiBody({
            description: 'Datos para crear la subcategoría',
            schema: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    categoryId: { type: 'string', description: 'UUID de la categoría padre' }
                }
            }
        })
        async create(@Body() createSubCategoryDto: CreateSubCategoryDto): Promise<ResponseSubCategoryDto> {
            const newSubCategory = await this.subCategoriesService.createSubCategories(createSubCategoryDto);
                return newSubCategory;
        }
        
        @Get()
        @ApiOperation({ summary: 'Obtener todas las subcategorías activas' })
        async findAll() {
            return this.subCategoriesService.getAllSubCategoriesActive(); // Solo activas
        }
        
        @Get('all')
        @ApiOperation({ summary: 'Listar todas las subcategorías (activas e inactivas)' })
        @ApiResponse({ status: 200, description: 'Lista de subcategorías', type: [SubCategories] })
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(rolEnum.ADMIN)
        @ApiSecurity('bearer')
            async findAllForAdmin(): Promise<SubCategories[]> {
                return this.subCategoriesService.getAllSubCategories();
        }

        @Get('by-category/:categoryId')
        @ApiOperation({ summary: 'Obtener subcategorías activas por categoría' })
        @ApiResponse({ status: 200, description: 'Subcategorías encontradas', type: [SubCategories] })
        async findByCategory(@Param('categoryId') categoryId: string): Promise<SubCategories[]> {
            return this.subCategoriesService.getSubCategoriesByCategory(categoryId);
        }
        
        @Get(':id/actives')
        @ApiOperation({ summary: 'Obtener una subcategoría activa por ID' })
        @ApiResponse({ status: 200, description: 'Subcategoría encontrada', type: SubCategories })
        @ApiResponse({ status: 404, description: 'Subcategoría no encontrada' })
        async findOneActive(@Param('id') id: string): Promise<SubCategories> {
            return this.subCategoriesService.getSubCategoryActive(id);
        }
        
        @Get(':id')
        @ApiOperation({ summary: 'Obtener una subcategoría por ID' })
        @ApiResponse({ status: 200, description: 'Subcategoría encontrada', type: SubCategories })
        @ApiResponse({ status: 404, description: 'Subcategoría no encontrada' })
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(rolEnum.ADMIN)
        @ApiSecurity('bearer')
        async findOne(@Param('id') id: string): Promise<SubCategories> {
            return this.subCategoriesService.getSubCategory(id);
        }
        
        //  @Get(':marcaId/products')
        // @ApiOperation({ summary: 'Obtener productos por marca' })
        // @ApiResponse({ status: 200, description: 'Productos obtenidos', type: [Products] })
        // @ApiResponse({ status: 404, description: 'Producto no encontrado' })
        // async findProductsByMarca(@Param('marcaId') marcaId: string) {
        //     return this.marcaService.findProductByMarca(marcaId);
        // }
        
        @Put(':id')
        @ApiOperation({ summary: 'Modificar una subcategoría' })
        @ApiResponse({ status: 200, description: 'Subcategoría modificada', type: UpdateSubCategoryDto })
        @ApiResponse({ status: 404, description: 'Subcategoría no encontrada' })
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(rolEnum.ADMIN)
        @ApiSecurity('bearer')
        @ApiBody({
            description: 'Datos para actualizar la subcategoría',
            schema: {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                }
            }
        })
        async update(@Param('id') id: string, @Body() updateSubCategoryDto: UpdateSubCategoryDto): Promise<SubCategories> {
            return this.subCategoriesService.updateSubCategory(id, updateSubCategoryDto);
        }
        
        @Patch(':id/state')
        @ApiOperation({ summary: 'Cambiar estado de subcategoría (activar/desactivar) - Solo Admin' })
        @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(rolEnum.ADMIN)
        @ApiSecurity('bearer')
        async updateState(
            @Param('id') id: string,
            @Body() updateStateSubCategoryDto: UpdateSubCategoryStateDto
        ) {
            return this.subCategoriesService.updateState(id, updateStateSubCategoryDto.state);
        }
    
        @Patch(':id/image')
        @ApiOperation({ summary: 'Subir o reemplazar imagen de subcategoría - Solo Admin' })
        @ApiResponse({ status: 200, description: 'Imagen actualizada correctamente' })
        @ApiConsumes('multipart/form-data')
        @ApiBody({
            schema: {
                type: 'object',
                properties: {
                    file: {
                        type: 'string',
                        format: 'binary'
                    }
                }
            }
        })
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(rolEnum.ADMIN)
        @ApiSecurity('bearer')
        @UseInterceptors(FileInterceptor('file'))
        async uploadImage(
            @Param('id') id: string,
            @UploadedFile() file: Express.Multer.File
        ) {
            return this.fileUploadService.uploadFile(file, 'subcategory', id);
        }
    
        @Delete(':id/image')
        @ApiOperation({ summary: 'Eliminar imagen de subcategoría - Solo Admin' })
        @ApiResponse({ status: 200, description: 'Imagen eliminada correctamente' })
        @ApiResponse({ status: 404, description: 'Subcategoría no encontrada' })
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Roles(rolEnum.ADMIN)
        @ApiSecurity('bearer')
        async deleteImage(@Param('id') id: string) {
            const subcategory = await this.subCategoriesService.getSubCategory(id);
            
            if (!subcategory.imageUrl) {
                throw new BadRequestException('La subcategoría no tiene imagen');
            }
            
            await this.cloudinaryService.deleteFile(subcategory.imageUrl);
            return this.subCategoriesService.removeImage(id);
        }
    
    
}