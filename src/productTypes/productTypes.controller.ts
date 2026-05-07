import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ProductTypesService } from "./productTypes.service";
import { ResponseProductTypeDto } from "./dto/response-productType.dto";
import { CreateProductTypeDto } from "./dto/create-productType.dto";
import { ProductTypes } from "./productTypes.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { rolEnum } from "src/users/users.entity";
import { UpdateProductTypeDto } from "./dto/update-productType.dto";
import { UpdateProductTypeStateDto } from "./dto/update-productTypeState.dto";

@ApiTags('ProductTypes')
@Controller("product_types")
export class ProductTypesController {
    constructor(
        private readonly productTypesService: ProductTypesService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo tipo de producto' })
    @ApiResponse({ status: 201, description: 'Tipo de producto creado', type: ResponseProductTypeDto })
    @ApiResponse({ status: 400, description: 'El tipo de producto ya existe.' })
    @HttpCode(HttpStatus.CREATED)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para crear el tipo de producto',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
            }
        }
    })
    async create(@Body() createProductTypeDto: CreateProductTypeDto): Promise<ResponseProductTypeDto> {
        const newProductType = await this.productTypesService.createProductType(createProductTypeDto);
            return newProductType;
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los tipos de productos activos' })
    async findAll() {
        return this.productTypesService.getAllProductTypesActive(); // Solo activas
    }

    @Get('all')
    @ApiOperation({ summary: 'Listar todos los tipos de productos (activos e inactivos)' })
    @ApiResponse({ status: 200, description: 'Lista de tipos de productos', type: [ProductTypes] })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
        async findAllForAdmin(): Promise<ProductTypes[]> {
            return this.productTypesService.getAllProductTypes();
    }

    @Get(':id/actives')
    @ApiOperation({ summary: 'Obtener un tipo de producto activo por ID' })
    @ApiResponse({ status: 200, description: 'Tipo de producto encontrado', type: ProductTypes })
    @ApiResponse({ status: 404, description: 'Tipo de producto no encontrado' })
    async findOneActive(@Param('id') id: string): Promise<ProductTypes> {
        return this.productTypesService.getProductTypesActive(id);
    }
        

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un tipo de producto por ID' })
    @ApiResponse({ status: 200, description: 'Tipo de producto encontrado', type: ProductTypes })
    @ApiResponse({ status: 404, description: 'Tipo de producto no encontrado' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async findOne(@Param('id') id: string): Promise<ProductTypes> {
        return this.productTypesService.getProductTypes(id);
    }


    @Put(':id')
    @ApiOperation({ summary: 'Modificar un tipo de producto' })
    @ApiResponse({ status: 200, description: 'Tipo de producto modificado', type: UpdateProductTypeDto })
    @ApiResponse({ status: 404, description: 'Tipo de producto no encontrado' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para actualizar el tipo de producto',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' }
            }
        }
    })
    async update(@Param('id') id: string, @Body() updateProductTypeDto: UpdateProductTypeDto): Promise<ProductTypes> {
        return this.productTypesService.updateProductTypes(id, updateProductTypeDto);
    }
        
    @Patch(':id/state')
    @ApiOperation({ summary: 'Cambiar estado del tipo de producto (activar/desactivar) - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async updateState(
        @Param('id') id: string,
        @Body() updateStateProductTypeDto: UpdateProductTypeStateDto
    ) {
        return this.productTypesService.updateState(id, updateStateProductTypeDto.state);
    }
}