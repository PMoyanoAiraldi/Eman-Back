import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-products.dto";
import { ResponseProductDto } from "./dto/response-products.dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { rolEnum } from "src/users/users.entity";
import { Products } from "./products.entity";
import { UpdateProductDto } from "./dto/update-products.dto";
import { UpdateProductStateDto } from "./dto/update-productsState.dto";

@ApiTags('Products')
@Controller("products")
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo producto - Solo Admin' })
    @ApiResponse({ status: 201, description: 'Producto creado', type: ResponseProductDto })
    @ApiResponse({ status: 400, description: 'El producto ya existe.' })
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para crear el producto',
        schema: {
            type: 'object',
            properties: {name: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                gender: { type: 'string', enum: ['hombre', 'mujer', 'unisex'] },
                isFeatured:{ type: 'boolean'},
                brandId: { type: 'string' },
                categoryId: { type: 'string' },
                subcategoryId: { type: 'string' },
                productTypeId: { type: 'string' },
            }
        }
    })
    async create(@Body() createProductDto: CreateProductDto): Promise<ResponseProductDto> {
        return this.productsService.createProduct(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los productos activos con filtros opcionales' })
    @ApiQuery({ name: 'categoryId', required: false })
    @ApiQuery({ name: 'subcategoryId', required: false })
    @ApiQuery({ name: 'brandId', required: false })
    @ApiQuery({ name: 'typeId', required: false })
    @ApiQuery({ name: 'gender', required: false, enum: ['hombre', 'mujer', 'unisex'] })
    async findAll(
        @Query('categoryId') categoryId?: string,
        @Query('subcategoryId') subcategoryId?: string,
        @Query('brandId') brandId?: string,
        @Query('typeId') productTypeId?: string,
        @Query('gender') gender?: string,
    ): Promise<Products[]> {
        return this.productsService.getAllProductsActive({ categoryId, subcategoryId, brandId, productTypeId, gender });
    }

    @Get('all')
    @ApiOperation({ summary: 'Listar todos los productos (activos e inactivos) - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Lista de productos', type: [ResponseProductDto] })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async findAllForAdmin(): Promise<Products[]> {
        return this.productsService.getAllProducts();
    }

    @Get('featured')
    getFeatured() {
        return this.productsService.getFeaturedProducts();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un producto por ID' })
    @ApiResponse({ status: 200, description: 'Producto encontrado', type: ResponseProductDto })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    async findOne(@Param('id') id: string): Promise<Products> {
        return this.productsService.getProductActive(id);
    }

    @Get(':id/admin')
    @ApiOperation({ summary: 'Obtener un producto por ID - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Producto encontrado', type: ResponseProductDto })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async findOneForAdmin(@Param('id') id: string): Promise<Products> {
        return this.productsService.getProduct(id);
    }


    @Put(':id')
    @ApiOperation({ summary: 'Modificar un producto - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Producto modificado', type: ResponseProductDto })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para actualizar el producto',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                gender: { type: 'string', enum: ['hombre', 'mujer', 'unisex'] },
                isFeatured: { type: 'boolean'},
                brandId: { type: 'string' },
                categoryId: { type: 'string' },
                subcategoryId: { type: 'string' },
                productTypeId: { type: 'string' },
            }
        }
    })
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Products> {
        return this.productsService.updateProduct(id, updateProductDto);
    }

    @Patch(':id/state')
    @ApiOperation({ summary: 'Cambiar estado del producto (activar/desactivar) - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async updateState(
        @Param('id') id: string,
        @Body() updateProductStateDto: UpdateProductStateDto
    ) {
        return this.productsService.updateState(id, updateProductStateDto.state);
    }

}