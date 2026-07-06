import { Injectable, NotFoundException } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../order/order.entity';
import { DataSource, Repository } from 'typeorm';
import { Payment } from 'mercadopago';
import { PaymentFormData } from './payments.types';
import { stateEnum } from '../order/order.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';
import { ProductVariants } from '../productVariants/productVariants.entity';
import { methodEnum, Payments, statusEnum } from './payments.entity';

// Tarjetas que NO queremos ofrecer (todo lo que no sea Visa/Mastercard).
// Si Andrea quiere sumar/sacar alguna en el futuro, se edita esta lista.
const EXCLUDED_CARD_BRANDS = ['amex', 'naranja', 'cabal', 'cencosud', 'tarshop', 'diners'];

// Traduce lo que devuelve MP a tus enums en español
const mapMethod = (paymentTypeId: string): methodEnum => {
    if (paymentTypeId === 'debit_card') return methodEnum.TARJETA_DEBITO;
    if (paymentTypeId === 'credit_card') return methodEnum.TARJETA_CREDITO;
    return methodEnum.TRANSFERENCIA;
};

const mapStatus = (mpStatus: string): statusEnum => {
    if (mpStatus === 'approved') return statusEnum.APROBADO;
    if (mpStatus === 'rejected') return statusEnum.RECHAZADO;
    return statusEnum.PENDIENTE; // in_process
};


@Injectable()
export class PaymentsService {
    private client: MercadoPagoConfig;

    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(Payments)
        private readonly paymentsRepository: Repository<Payments>,
        private dataSource: DataSource,
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
                payment_methods: {
                    excluded_payment_methods: EXCLUDED_CARD_BRANDS.map(id => ({ id })),
                    excluded_payment_types: [
                        { id: 'ticket' }, // saca efectivo (Rapipago/Pago Fácil)
                    ],
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
        console.log(JSON.stringify(response.payment_methods, null, 2));

        return { preferenceId: response.id, initPoint: response.init_point }
    }

    async processPayment(formData: PaymentFormData, orderId: string) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) throw new NotFoundException(`Orden ${orderId} no encontrada`);

        const payment = new Payment(this.client);

        const result = await payment.create({
            body: {
                transaction_amount: Number(order.total), // importante: el monto sale de TU orden, no del formData del front (evita manipulación)
                token: formData.token,
                description: `Orden ${orderId}`,
                installments: formData.installments,
                payment_method_id: formData.payment_method_id,
                issuer_id: formData.issuer_id,
                payer: {
                    email: formData.payer.email,
                    identification: formData.payer.identification,
                },
            },
        });

        console.log('MP result completo:', JSON.stringify(result, null, 2));

        // Monto real que se le cobró en la tarjeta (puede incluir interés por cuotas)
        const totalPaid = result.transaction_details?.total_paid_amount ?? Number(order.total);

        // Guardamos el registro del pago
        const paymentRecord = this.paymentsRepository.create({
            order:              order,
            method:             mapMethod(result.payment_type_id ?? ''),
            status:             mapStatus(result.status ?? ''),
            amount:             totalPaid,
            installments:       result.installments,
            installmentsAmount: result.transaction_details?.installment_amount,
            transactionId:      String(result.id),
            mpPaymentId:        String(result.id),
            paidAt:             result.status === 'approved' ? new Date() : undefined,
        });
        await this.paymentsRepository.save(paymentRecord);

        // Actualizamos el estado de la orden según lo que respondió MP
        if (result.status === 'approved') {
            await this.orderRepository.update(orderId, { state: stateEnum.CONFIRMADO });
        } else if (result.status === 'rejected') {
            await this.orderRepository.update(orderId, { state: stateEnum.CANCELADO });
        }
        // Si es 'in_process', lo dejamos como está (pendiente) — lo resuelve el webhook después

        return {
            status: result.status,            // 'approved' | 'rejected' | 'in_process'
            statusDetail: result.status_detail,
            paymentId: result.id,
            totalPaid,
            installments: result.installments,
            installmentsAmount: result.transaction_details?.installment_amount,
        };
    }


    @Cron(CronExpression.EVERY_HOUR)
    async cancelStaleOrders() {
        const limite = new Date();
        limite.setHours(limite.getHours() - 24);

        const orderExpired = await this.orderRepository.find({
            where: {
                state: stateEnum.PENDIENTE,
                createdAt: LessThan(limite),
            },
            relations: ['orderDetail'], // necesitamos los detalles para saber qué stock devolver
        });

        for (const order of orderExpired) {
            await this.dataSource.transaction(async (manager) => {
                // Devolver el stock de cada línea de la orden
                for (const detail of order.orderDetail) {
                    const variant = await manager.findOne(ProductVariants, {
                        where: { id: detail.variant.id },
                    });
                    if (variant) {
                        variant.stock += detail.quantity;
                        await manager.save(ProductVariants, variant);
                    }
                }
                // Cancelar la orden
                await manager.update(Order, order.id, { state: stateEnum.CANCELADO });
            });
        }

        if (orderExpired.length > 0) {
            console.log(`Canceladas ${orderExpired.length} órdenes vencidas, stock repuesto`);
        }
    }
}