import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ProductVariantsService } from "./productVariants.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { ResponseProductDto } from "src/products/dto/response-products.dto";
import { rolEnum } from "src/users/users.entity";
import { ProductVariants } from "./productVariants.entity";
import { CreateProductVariantsDto } from "./dto/create-productVariants.dto";
import { ResponseProductVariantsDto } from "./dto/response-productVariants.dto";
import { UpdateProductVariantsDto } from "./dto/update-productVariants.dto";

@ApiTags('Product_variants')
@Controller("product_variants")
export class ProductVariantsController {
    constructor(
        private readonly productVariantsService: ProductVariantsService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Crear una variante de producto - Solo Admin' })
    @ApiResponse({ status: 201, description: 'Variante de producto creado', type: ResponseProductDto })
    @ApiResponse({ status: 400, description: 'La variante de producto ya existe.' })
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiBody({
            description: 'Datos para crear la variante del producto',
            schema: {
                type: 'object',
                properties: {
                    stock: { type: 'number' },
                    sizeId: { type: 'string' },
                    colorId: { type: 'string'},
                    productId: { type: 'string' },
                }
            }
        })
        async create(@Body() createProductVariantsDto: CreateProductVariantsDto): Promise<ResponseProductVariantsDto> {
            return this.productVariantsService.addVariants(createProductVariantsDto);
        }

    @Patch(':id/stock')
    @ApiOperation({ summary: 'Modificar el stock de una variante de un producto' })
    @ApiResponse({ status: 200, description: 'Stock modificado', type: UpdateProductVariantsDto })
    @ApiResponse({ status: 404, description: 'Variante no encontrada' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para actualizar el stock',
        schema: {
            type: 'object',
            properties: {
                stock: { type: 'number' }
            }
        }
    })
    async update(@Param('id') id: string, @Body() updateProductVariantsDto: UpdateProductVariantsDto): Promise<ProductVariants> {
            return this.productVariantsService.updateStock(id, updateProductVariantsDto);
        }

    @Get('filter')
    @ApiOperation({ summary: 'Obtener variantes por talle y/o color' })
    @ApiResponse({ status: 200, description: 'Variantes encontradas', type: ProductVariants })
    @ApiResponse({ status: 404, description: 'Variantes no encontradas' })
    @ApiSecurity('bearer')
    async getByFilters(
        @Query('sizeId') sizeId?: string,
        @Query('colorId') colorId?: string,
    ): Promise <ProductVariants[]> {
        return await this.productVariantsService.getVariantsByFilters(sizeId, colorId);
    }

    @Get(':productId')
    @ApiOperation({ summary: 'Obtener variantes por producto' })
    @ApiResponse({ status: 200, description: 'Variantes encontradas', type: ProductVariants })
    @ApiResponse({ status: 404, description: 'Variantes no encontradas' })
    @ApiSecurity('bearer')
    async find(@Param('productId') productId: string): Promise<ProductVariants[]> {
        return await this.productVariantsService.getVariantsByProduct(productId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una variante - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Variante eliminada correctamente' })
    @ApiResponse({ status: 404, description: 'Variante no encontrada' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async remove(@Param('id') id: string): Promise<void> {
        return this.productVariantsService.removeVariants(id);
    }
        
}