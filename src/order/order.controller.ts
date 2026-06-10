import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { rolEnum } from "src/users/users.entity";
import { stateEnum } from "./order.entity";

@ApiTags('Order')
@Controller("order")
export class OrderController {
    constructor(
        private readonly orderService: OrderService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva orden - Público (guest o usuario)' })
    @ApiResponse({ status: 201, description: 'Orden creada correctamente' })
    @ApiResponse({ status: 400, description: 'Stock insuficiente o datos inválidos' })
    @ApiResponse({ status: 404, description: 'Variante o producto no encontrado' })
    @HttpCode(HttpStatus.CREATED)
    @ApiBody({
        description: 'Datos para crear la orden',
        schema: {
            type: 'object',
            required: ['guestName', 'guestEmail', 'guestPhone', 'address', 'city', 'zipCode', 'shippingType', 'items'],
            properties: {
                guestName:      { type: 'string', example: 'Paula García' },
                guestEmail:     { type: 'string', example: 'paula@gmail.com' },
                guestPhone:     { type: 'string', example: '3493123456' },
                address:        { type: 'string', example: 'San Martín 123' },
                city:           { type: 'string', example: 'Galvez' },
                zipCode:        { type: 'string', example: '2538' },
                shippingType:   { type: 'string', enum: ['coordinado', 'correo_argentino'] },
                shippingCost:   { type: 'number', example: 0 },
               // discountAmount: { type: 'number', example: 0 },
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['productId', 'variantId', 'productName', 'quantity', 'unitPrice'],
                        properties: {
                            productId:   { type: 'string', example: 'uuid-del-producto' },
                            variantId:   { type: 'string', example: 'uuid-de-la-variante' },
                            productName: { type: 'string', example: 'Cardigan de hilo' },
                            quantity:    { type: 'number', example: 1 },
                            unitPrice:   { type: 'number', example: 32000 },
                        }
                    }
                }
            }
        }
    })
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.orderService.createOrder(createOrderDto)
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las órdenes - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Lista de órdenes' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    findAll() {
        return this.orderService.getAllOrders()
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una orden por ID - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Orden encontrada' })
    @ApiResponse({ status: 404, description: 'Orden no encontrada' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    findOne(@Param('id') id: string) {
        return this.orderService.getOrderById(id)
    }

    @Patch(':id/state')
    @ApiOperation({ summary: 'Cambiar estado de la orden - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
    @ApiResponse({ status: 404, description: 'Orden no encontrada' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    @ApiBody({
        description: 'Nuevo estado de la orden',
        schema: {
            type: 'object',
            required: ['state'],
            properties: {
                state: {
                    type: 'string',
                    enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'],
                    example: 'confirmado'
                }
            }
        }
        })
    updateState(
        @Param('id') id: string,
        @Body('state') state: stateEnum
    ) {
        return this.orderService.updateState(id, state)
    }
}