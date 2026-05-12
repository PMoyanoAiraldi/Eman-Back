import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ProductSizesService } from "./productSizes.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { ResponseProductDto } from "src/products/dto/response-products.dto";
import { rolEnum } from "src/users/users.entity";
import { CreateProductSizeDto } from "./dto/create-productSize.dto";
import { ResponseProductSizeDto } from "./dto/response-productSize.dto";
import { UpdateProductSizeDto } from "./dto/update-productSize.dto";
import { ProductSizes } from "./productSizes.entity";

@ApiTags('Product_sizes')
@Controller("product_sizes")
export class ProductSizesController {
    constructor(
        private readonly productSizeService: ProductSizesService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo talle de producto - Solo Admin' })
    @ApiResponse({ status: 201, description: 'Talle de producto creado', type: ResponseProductDto })
    @ApiResponse({ status: 400, description: 'El talle de producto ya existe.' })
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiBody({
            description: 'Datos para crear el talle del producto',
            schema: {
                type: 'object',
                properties: {
                    stock: { type: 'number' },
                    sizeId: { type: 'string' },
                    productId: { type: 'string' },
                }
            }
        })
        async create(@Body() createProductSizeDto: CreateProductSizeDto): Promise<ResponseProductSizeDto> {
            return this.productSizeService.addSize(createProductSizeDto);
        }

    @Patch(':id/stock')
    @ApiOperation({ summary: 'Modificar el stock del talle de un producto' })
    @ApiResponse({ status: 200, description: 'Talle de producto modificado', type: UpdateProductSizeDto })
    @ApiResponse({ status: 404, description: 'Talle de producto no encontrado' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Datos para actualizar el stock del talle de un producto',
        schema: {
            type: 'object',
            properties: {
                stock: { type: 'number' }
            }
        }
    })
    async update(@Param('id') id: string, @Body() updateProductSizeDto: UpdateProductSizeDto): Promise<ProductSizes> {
            return this.productSizeService.updateStock(id, updateProductSizeDto);
        }

    @Get('by-size/:sizeId')
    @ApiOperation({ summary: 'Obtener talles por producto' })
    @ApiResponse({ status: 200, description: 'Talle de producto encontrado', type: ProductSizes })
    @ApiResponse({ status: 404, description: 'Talle de producto no encontrado' })
    @ApiSecurity('bearer')
    async findSizeByProduct(@Param('sizeId') sizeId: string): Promise<ProductSizes[]> {
        return this.productSizeService.getProductsBySize(sizeId);
    }


    @Get(':productId')
    @ApiOperation({ summary: 'Obtener productos por talle' })
    @ApiResponse({ status: 200, description: 'Talle de producto encontrado', type: ProductSizes })
    @ApiResponse({ status: 404, description: 'Talle de producto no encontrado' })
    @ApiSecurity('bearer')
    async find(@Param('productId') productId: string): Promise<ProductSizes[]> {
        return this.productSizeService.getSizesByProduct(productId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar el talle del producto - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Talle de producto eliminado correctamente' })
    @ApiResponse({ status: 404, description: 'Talle de producto no encontrado' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async deleteProductSize(@Param('id') id: string) {
        return this.productSizeService.removeSize(id);
    }
        
}