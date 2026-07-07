import { Body, Controller, Headers, HttpCode, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import type { ProcessPaymentDto, MercadoPagoWebhookQuery, MercadoPagoWebhookBody  } from './payments.types';

@ApiTags('Payments')
@Controller("payments")
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
    ) { }

    @Post('create-preference')
    @ApiOperation({ summary: 'Crear preferencia de pago en MercadoPago' })
    @ApiBody({
    description: 'Datos para crear la preferencia de pago',
    schema: {
        type: 'object',
        required: [ 'orderId', 'shippingCost'],
        properties: {
            orderId:      { type: 'string', example: 'uuid-de-la-orden' },
            shippingCost: { type: 'number', example: 0 },
        }
    }
    })
    async createPreference(@Body() body: { orderId: string, shippingCost: number }) {
        return this.paymentsService.createPreference(body.orderId, body.shippingCost)
    }

    @Post('webhook')
    @HttpCode(200)
    @ApiOperation({ summary: 'Webhook de MercadoPago' })
    async handleWebhook(
        @Body() body: MercadoPagoWebhookBody,
        @Query() query: MercadoPagoWebhookQuery,
    ) {
        return this.paymentsService.handleWebhook(body, query);
    }

    @Post('process-payment')
    async processPayment(@Body() body: ProcessPaymentDto) {
        return this.paymentsService.processPayment(body.formData, body.orderId);
    }

}