import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { ResponseCategoryDto } from "./dto/response-category.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { Categories } from "./categories.entity";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateCategoryStateDto } from "./dto/update-categoryState.dto";

@ApiTags('Categories')
@Controller("categories")
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService,
    ) { }


    @Post()
    @ApiOperation({ summary: 'Crear una nueva categoría' })
    @ApiResponse({ status: 201, description: 'Categoría creada', type: ResponseCategoryDto })
    @ApiResponse({ status: 400, description: 'La categoría ya existe.' })
    @HttpCode(HttpStatus.CREATED)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para crear la categoría',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
            }
        }
    })
    async create(@Body() createCategoryDto: CreateCategoryDto): Promise<ResponseCategoryDto> {
        const newCategory = await this.categoriesService.createCategories(createCategoryDto);
            return newCategory;
    }
    
    @Get()
    @ApiOperation({ summary: 'Obtener todas las categorías activas' })
    async findAll() {
        return this.categoriesService.getAllCategoriesActive(); // Solo activas
    }
    
    @Get('all')
    @ApiOperation({ summary: 'Listar todas las categorías (activas e inactivas)' })
    @ApiResponse({ status: 200, description: 'Lista de categorías', type: [Categories] })
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
        async findAllForAdmin(): Promise<Categories[]> {
            return this.categoriesService.getAllCategories();
    }
    
    @Get(':id/actives')
    @ApiOperation({ summary: 'Obtener una categoría activa por ID' })
    @ApiResponse({ status: 200, description: 'Categoría encontrada', type: Categories })
    @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
    async findOneActive(@Param('id') id: string): Promise<Categories> {
        return this.categoriesService.getCategoryActive(id);
    }
    
    @Get(':id')
    @ApiOperation({ summary: 'Obtener una categoría por ID' })
    @ApiResponse({ status: 200, description: 'Categoría encontrada', type: Categories })
    @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
     // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
    async findOne(@Param('id') id: string): Promise<Categories> {
        return this.categoriesService.getCategory(id);
    }
    
    //  @Get(':marcaId/products')
    // @ApiOperation({ summary: 'Obtener productos por marca' })
    // @ApiResponse({ status: 200, description: 'Productos obtenidos', type: [Products] })
    // @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    // async findProductsByMarca(@Param('marcaId') marcaId: string) {
    //     return this.marcaService.findProductByMarca(marcaId);
    // }
    
    @Put(':id')
    @ApiOperation({ summary: 'Modificar una categoría' })
    @ApiResponse({ status: 200, description: 'Categoría modificada', type: UpdateCategoryDto })
    @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para actualizar la categoría',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' }
            }
        }
    })
    async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Categories> {
        return this.categoriesService.updateCategory(id, updateCategoryDto);
    }
    
    @Patch(':id/state')
    @ApiOperation({ summary: 'Cambiar estado de categoría (activar/desactivar) - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
    async updateState(
        @Param('id') id: string,
        @Body() updateStateCategoryDto: UpdateCategoryStateDto
    ) {
        return this.categoriesService.updateState(id, updateStateCategoryDto.state);
    }
}