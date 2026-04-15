import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Put } from "@nestjs/common";
import {  ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { BrandsService } from "./brands.service";
import { ResponseBrandDto } from "./dto/response-brand.dto";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { Brands } from "./brands.entity";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { UpdateBrandStateDto } from "./dto/update-brandState.dto";


@ApiTags('Brands')
@Controller("brands")
export class BrandsController {
    constructor(
        private readonly brandsService: BrandsService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva marca' })
    @ApiResponse({ status: 201, description: 'Marca creada', type: ResponseBrandDto })
    @ApiResponse({ status: 400, description: 'La marca ya existe.' })
    @HttpCode(HttpStatus.CREATED)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para crear la marca',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
            }
        }
    })
    async create(@Body() createBrandDto: CreateBrandDto): Promise<ResponseBrandDto> {
        const newBrand = await this.brandsService.createBrands(createBrandDto);
            return newBrand;
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las marcas activas' })
    async findAll() {
        return this.brandsService.getAllActive(); // Solo activas
    }

    @Get('all')
    @ApiOperation({ summary: 'Listar todas las marcas (activas e inactivas)' })
    @ApiResponse({ status: 200, description: 'Lista de marcas', type: [Brands] })
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
    async findAllForAdmin(): Promise<Brands[]> {
        return this.brandsService.getAllBrands();
    }

    @Get(':id/actives')
    @ApiOperation({ summary: 'Obtener una marca activa por ID' })
    @ApiResponse({ status: 200, description: 'Marca encontrada', type: Brands })
    @ApiResponse({ status: 404, description: 'Marca no encontrada' })
    async findOneActive(@Param('id') id: string): Promise<Brands> {
        return this.brandsService.getBrandActive(id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una marca por ID' })
    @ApiResponse({ status: 200, description: 'Marca encontrada', type: Brands })
    @ApiResponse({ status: 404, description: 'Marca no encontrada' })
     // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
    async findOne(@Param('id') id: string): Promise<Brands> {
            return this.brandsService.getBrand(id);
    }

    //  @Get(':marcaId/products')
    // @ApiOperation({ summary: 'Obtener productos por marca' })
    // @ApiResponse({ status: 200, description: 'Productos obtenidos', type: [Products] })
    // @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    // async findProductsByMarca(@Param('marcaId') marcaId: string) {
    //     return this.marcaService.findProductByMarca(marcaId);
    // }

    @Put(':id')
    @ApiOperation({ summary: 'Modificar una marca' })
    @ApiResponse({ status: 200, description: 'Marca modificada', type: UpdateBrandDto })
    @ApiResponse({ status: 404, description: 'Marca no encontrada' })
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para actualizar la marca',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' }
            }
        }
    })
    async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto): Promise<Brands> {
        return this.brandsService.updateBrand(id, updateBrandDto);
    }

    @Patch(':id/state')
    @ApiOperation({ summary: 'Cambiar estado de marca (activar/desactivar) - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    @ApiSecurity('bearer')
    async updateState(
        @Param('id') id: string,
        @Body() updateStateBrandDto: UpdateBrandStateDto
    ) {
        return this.brandsService.updateState(id, updateStateBrandDto.state);
    }


}