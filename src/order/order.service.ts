import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order, stateEnum } from "./order.entity";
import { DataSource, Repository } from "typeorm";
import { OrderDetail } from "src/orderDetail/orderDetail.entity";
import { ProductVariants } from "src/productVariants/productVariants.entity";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderDetail)
        private orderDetailRepository: Repository<OrderDetail>,
        @InjectRepository(ProductVariants)
        private variantRepository: Repository<ProductVariants>,
        private dataSource: DataSource,
    ) { }

    async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
        return await this.dataSource.transaction(async (manager) => { // <- transaction: grupo de operaciones de base de datos que se ejecutan todas juntas o ninguna 

        // 1. Crear la orden base
        const order = manager.create(Order, {  // manager: es como un repository temporal que agrupa todo
            guestName:      createOrderDto.guestName,
            guestEmail:     createOrderDto.guestEmail,
            guestPhone:     createOrderDto.guestPhone,
            address:        createOrderDto.address,
            city:           createOrderDto.city,
            zipCode:        createOrderDto.zipCode,
            shippingType:   createOrderDto.shippingType,
            shippingCost:   createOrderDto.shippingCost ?? 0,
            // discountAmount: createOrderDto.discountAmount ?? 0, <- se implementa con cupones
            total:          0,
        })
        
        const savedOrder = await manager.save(Order, order)

        // 2. Procesar cada item del carrito
        let subtotal = 0

        for (const item of createOrderDto.items) {

        // Verificar que la variante existe
        const variant = await manager.findOne(ProductVariants, {
            where: { id: item.variantId }
        })
        if (!variant) {
            throw new NotFoundException(`Variante ${item.variantId} no encontrada`)
        }

        // Verificar stock suficiente
        if (variant.stock < item.quantity) {
            throw new BadRequestException(
                `Stock insuficiente para "${item.productName}". Stock disponible: ${variant.stock}`
            )
        }

        // Descontar stock
        variant.stock -= item.quantity
        await manager.save(ProductVariants, variant)

        // Crear el detalle de la orden
        const detail = manager.create(OrderDetail, {
            orders:      savedOrder,
            product:     { id: item.productId },
            variant:     { id: item.variantId },
            productName: item.productName,
            quantity:    item.quantity,
            unitPrice:   item.unitPrice,
        })
        await manager.save(OrderDetail, detail)

        subtotal += item.unitPrice * item.quantity
        }

        // 3. Calcular total final
        const shippingCost    = createOrderDto.shippingCost ?? 0
        // const discountAmount  = createOrderDto.discountAmount ?? 0
        savedOrder.total      = subtotal + shippingCost 
        // - discountAmount  → se implementa con cupones
        await manager.save(Order, savedOrder)

        return savedOrder
        })
    }

    async getOrderById(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: [
                'orderDetail',
                'orderDetail.product',
                'orderDetail.variant',
                'orderDetail.variant.size',
                'orderDetail.variant.color',
            ]
        })
        if (!order) throw new NotFoundException(`Orden con ID ${id} no encontrada`)
        return order
    }

    async getAllOrders(): Promise<Order[]> {
        return this.orderRepository.find({
            relations: [
                'orderDetail',
                'orderDetail.product',
                'orderDetail.variant',
            ],
            order: { createdAt: 'DESC' }
        })
    }

    async updateState(id: string, state: stateEnum): Promise<Order> {
        const order = await this.getOrderById(id)
        order.state = state 
        return this.orderRepository.save(order)
    }

    async getOrderSummary(id: string) {
    const order = await this.orderRepository.findOne({
        where: { id },
        relations: [
            'orderDetail',
            'orderDetail.product',
            'orderDetail.product.images', 
            'orderDetail.variant',
            'orderDetail.variant.size',
            'orderDetail.variant.color',
            'payments', // para traer el método de pago y cuotas
        ],
    })
    if (!order) throw new NotFoundException(`Orden con ID ${id} no encontrada`)

    // Tomamos el pago más reciente (por si hubo reintentos)
    const lastPayment = order.payments?.length
        ? order.payments[order.payments.length - 1]
        : null

    // Solo devolvemos lo necesario para mostrarle al cliente —
    // nada de datos internos sensibles
    return {
        id: order.id,
        state: order.state,
        total: order.total,
        shippingCost: order.shippingCost,
        shippingType: order.shippingType,
        address: order.address,
        city: order.city,
        zipCode: order.zipCode,
        createdAt: order.createdAt,
        items: order.orderDetail.map(detail => {
            // Buscamos la imagen marcada como principal; si no hay ninguna, usamos la primera disponible
            const primaryImage = detail.product?.images?.find(img => img.isPrimary)
            const fallbackImage = detail.product?.images?.[0]

            return{
            productName: detail.productName,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            color: detail.variant?.color?.name,
            size: detail.variant?.size?.name,
            image: primaryImage?.url ?? fallbackImage?.url ?? null,
            }
        }),
        payment: lastPayment ? {
            method: lastPayment.method,
            status: lastPayment.status,
            installments: lastPayment.installments,
            installmentsAmount: lastPayment.installmentsAmount,
        } : null,
    }
}
}

