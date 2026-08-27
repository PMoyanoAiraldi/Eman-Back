import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { rolEnum, Users } from "src/users/users.entity";
import { stateEnum } from "./order.entity";
import { OptionalJwtAuthGuard } from "src/auth/guards/optional-jwt-auth.guard";

interface RequestWithUser extends Request {
    user?: Users;
}

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
            required: ['guestName', 'guestEmail', 'guestPhone', 'shippingType', 'items'],
            properties: {
                guestName:      { type: 'string', example: 'Paula García' },
                guestEmail:     { type: 'string', example: 'paula@gmail.com' },
                guestPhone:     { type: 'string', example: '3493123456' },
                streetName:     { type: 'string', example: 'Entre Rios' },
                streetNumber:   { type: 'string', example: '123' },
                floor:          { type: 'string', example: 'EJ: 2' },
                apartment:      { type: 'string', example: 'EJ B' },
                city:           { type: 'string', example: 'Galvez' },
                provinceCode:   { type: 'string', example: 'S' },
                zipCode:        { type: 'string', example: '2255' },
                shippingType:   { type: 'string', enum: ['coordinado', 'correo_argentino'] },
                deliveryType:   { type: 'string', enum: ['domicilio', 'sucursal'], description: 'Solo aplica si shippingType es correo_argentino' },
                agencyCode:     { type: 'string', example: 'B0107', description: 'Solo si deliveryType es sucursal' },
                agencyName:     { type: 'string', example: 'Monte Grande' },
                agencyAddress:  { type: 'string', example: 'Vicente López 448' },
                agencyCity:     { type: 'string', example: 'Monte Grande' },
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
    @UseGuards(OptionalJwtAuthGuard) // guard custom que no rompe si no hay token
    create(@Body() createOrderDto: CreateOrderDto, @Req() req: RequestWithUser) {
        console.log('req.user:', req.user);
        const userId = req.user?.id ?? null;
        return this.orderService.createOrder(createOrderDto, userId)
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

    @Get('user/:userId')
    @ApiOperation({ summary: 'Obtener las órdenes de un usuario logueado' })
    @UseGuards(JwtAuthGuard)
    @ApiSecurity('bearer')
    getOrdersByUser(@Param('userId') userId: string, @Req() req: RequestWithUser) {
        if (req.user?.id !== userId) {
            throw new ForbiddenException('No podés ver las compras de otro usuario');
        }
        return this.orderService.getOrdersByUser(userId);
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

    @Get('mine/:id/summary')
    @ApiOperation({ summary: 'Resumen de una orden propia - Requiere login' })
    @ApiResponse({ status: 200, description: 'Resumen de la orden' })
    @ApiResponse({ status: 403, description: 'La orden no pertenece al usuario logueado' })
    @ApiResponse({ status: 404, description: 'Orden no encontrada' })
    @UseGuards(JwtAuthGuard)
    @ApiSecurity('bearer')
    getMyOrderSummary(@Param('id') id: string, @Req() req: RequestWithUser) {
        return this.orderService.getOrderSummary(id, req.user?.id)
    }

    @Get(':id/summary')
    @ApiOperation({ summary: 'Resumen de una orden - Público (para pantalla de confirmación)' })
    @ApiResponse({ status: 200, description: 'Resumen de la orden' })
    @ApiResponse({ status: 404, description: 'Orden no encontrada' })
    findSummary(@Param('id') id: string) {
    return this.orderService.getOrderSummary(id)
    }

    @Post(':id/shipping-label')
    @ApiOperation({ summary: 'Generar etiqueta de envío en MiCorreo - Solo Admin' })
    @ApiResponse({ status: 200, description: 'Envío importado correctamente a MiCorreo' })
    @ApiResponse({ status: 400, description: 'La orden no es de Correo Argentino o ya tiene envío importado' })
    @ApiResponse({ status: 404, description: 'Orden no encontrada' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    generateShippingLabel(@Param('id') id: string) {
        return this.orderService.generateShippingLabel(id);
    }




}