import { Injectable, NotFoundException } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/order/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
    private client: MercadoPagoConfig;

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>
    ) {
        this.client = new MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN as string,
        });
    }

    async createPreference( orderId: string, shippingCost: number) {

        // 1. Buscar la orden con sus detalles
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['orderDetail']
            })
        if (!order) throw new NotFoundException(`Orden ${orderId} no encontrada`)

        // 2. Crear la preferencia en MercadoPago
        const preference = new Preference(this.client);

        const response = await preference.create({
            body: {
                items: order.orderDetail.map(detail => ({
                    id:          detail.id,
                    title:       detail.productName,
                    quantity:    detail.quantity,
                    unit_price:  Number(detail.unitPrice),
                    currency_id: 'ARS',
                })),
                shipments: {
                    cost: shippingCost,
                    mode: 'not_specified',
                },
                // back_urls: {
                //     success: `${process.env.FRONTEND_URL}/orden-confirmada`, debo colcoar la url deployada en .env para que funcione
                //     failure: `${process.env.FRONTEND_URL}/checkout`,
                //     pending: `${process.env.FRONTEND_URL}/orden-pendiente`,
                //},
                //auto_return: 'approved',
                external_reference: orderId,
                notification_url: `${process.env.BACKEND_URL}/payments/webhook`,
            }
        });

        return { preferenceId: response.id, initPoint: response.init_point }
    }
}