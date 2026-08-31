import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeliveryType, Order, shippingTypeEnum, stateEnum } from "./order.entity";
import { DataSource, Repository } from "typeorm";
import { OrderDetail } from "src/orderDetail/orderDetail.entity";
import { ProductVariants } from "src/productVariants/productVariants.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { EmailService } from "src/email/email.service";
import { ShippingService } from "src/shipping/shipping.service";
import { CorreoArgentinoService } from "src/correo-argentino/correo-argentino.service";

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
        private emailService: EmailService,
        private readonly shippingService: ShippingService,
        private readonly correoArgentinoService: CorreoArgentinoService
    ) { }

    async createOrder(createOrderDto: CreateOrderDto, userId: string | null): Promise<Order> {
        return await this.dataSource.transaction(async (manager) => { // <- transaction: grupo de operaciones de base de datos que se ejecutan todas juntas o ninguna 

        // 1. Validar variantes, stock, y calcular subtotal ANTES de crear la orden
        let subtotal = 0
        const variantsToUpdate: { variant: ProductVariants; newStock: number }[] = []

        for (const item of createOrderDto.items) {
            const variant = await manager.findOne(ProductVariants, {
                where: { id: item.variantId }
            })
            if (!variant) {
                throw new NotFoundException(`Variante ${item.variantId} no encontrada`)
            }
            if (variant.stock < item.quantity) {
                throw new BadRequestException(
                    `Stock insuficiente para "${item.productName}". Stock disponible: ${variant.stock}`
                )
            }
            variantsToUpdate.push({ variant, newStock: variant.stock - item.quantity })
            subtotal += item.unitPrice * item.quantity
        }

        // 2. Calcular shippingCost en el backend
        const FREE_SHIPPING_THRESHOLD = 150000
        const isRegisteredUser = userId !== null
        const qualifiesForFreeShipping = isRegisteredUser && subtotal >= FREE_SHIPPING_THRESHOLD

        const shippingCost    = qualifiesForFreeShipping
            ? 0
            : (createOrderDto.shippingCost ?? 0)

        // 2.5. Calcular peso y dimensiones del paquete (solo aplica a Correo Argentino)
        // Nota: se calcula aunque el envío haya salido gratis por superar el umbral —
        // el paquete pesa lo mismo, lo que cambia es el costo, no el bulto físico.
        let packageData: Partial<Order> = {}

        if (createOrderDto.shippingType === shippingTypeEnum.CORREO_ARGENTINO) {
            const pkg = await this.shippingService.calculatePackage(
                createOrderDto.items.map(item => ({
                    productId: item.productId,
                    quantity:  item.quantity,
                }))
            )
            packageData = {
                packageWeight: pkg.weight,
                packageHeight: pkg.height,
                packageWidth:  pkg.width,
                packageLength: pkg.length,
            }
        }

          // 3. Crear la orden base
        const isSucursal = createOrderDto.shippingType === shippingTypeEnum.CORREO_ARGENTINO
            && createOrderDto.deliveryType === DeliveryType.SUCURSAL;

        const order = manager.create(Order, {  // manager: es como un repository temporal que agrupa todo
            guestName:      createOrderDto.guestName,
            guestEmail:     createOrderDto.guestEmail,
            guestPhone:     createOrderDto.guestPhone,
            shippingType:   createOrderDto.shippingType,
            deliveryType:   createOrderDto.deliveryType ?? null,

            streetName:     isSucursal ? null : createOrderDto.streetName,
            streetNumber:   isSucursal ? null : createOrderDto.streetNumber,
            floor:          isSucursal ? null :createOrderDto.floor,
            apartment:      isSucursal ? null : createOrderDto.apartment,
            city:           isSucursal ? createOrderDto.agencyCity : createOrderDto.city,

            provinceCode:   createOrderDto.provinceCode,
            zipCode:        createOrderDto.zipCode,

            agencyCode:     isSucursal ? createOrderDto.agencyCode : null,
            agencyName:     isSucursal ? createOrderDto.agencyName : null,
            agencyAddress:  isSucursal ? createOrderDto.agencyAddress : null,
            
            shippingCost,
            // discountAmount: createOrderDto.discountAmount ?? 0, <- se implementa con cupones
            ...packageData,
            total:          0,
            user:           userId ? { id: userId } : null,
        })

        // const discountAmount  = createOrderDto.discountAmount ?? 0
        //savedOrder.total      = subtotal + shippingCost 
        // - discountAmount  → se implementa con cupones
        
        const savedOrder = await manager.save(Order, order)

       // 4. Descontar stock y crear OrderDetail
        for (let i = 0; i < createOrderDto.items.length; i++) {
            const item = createOrderDto.items[i]
            const { variant, newStock } = variantsToUpdate[i]
            
        variant.stock = newStock
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

        }

       // 5. Total final
        savedOrder.total = subtotal + shippingCost
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

    async getOrdersByUser(userId: string): Promise<Order[]> {
        return this.orderRepository.find({
            where: { user: { id: userId } },
            relations: [
                'orderDetail',
                'orderDetail.product',
                'orderDetail.product.images',
                'orderDetail.variant',
                'orderDetail.variant.size',
                'orderDetail.variant.color',
                'payments',
            ],
            order: { createdAt: 'DESC' },
        })
    }

    async updateState(id: string, state: stateEnum): Promise<Order> {
        const order = await this.getOrderById(id)
        order.state = state 
        
        const updatedOrder = await this.orderRepository.save(order)

        // Solo avisamos por mail si pasa a "Enviado" y es Correo Argentino.
        // Coordinado y Retiro se resuelven por WhatsApp / entrega en persona,
        // esos casos van directo a "Entregado" sin pasar por acá.
        if (state === stateEnum.ENVIADO && order.shippingType === shippingTypeEnum.CORREO_ARGENTINO) {
            await this.emailService.sendDispatchNotification(order)
        }

        return updatedOrder
    }

    async getOrderSummary(id: string, requesterId?: string) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: [
                'user', // para poder validar dueño sin query extra
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

        // Si se pasa requesterId, es una consulta protegida (usuario logueado
        // pidiendo ver una orden propia) — validamos que coincida.
        // Si no se pasa, es el flujo público de guest checkout, sin chequeo.
        if (requesterId !== undefined && order.user?.id !== requesterId) {
            throw new ForbiddenException('No podés ver el detalle de esta orden')
        }


        // Tomamos el pago más reciente (por si hubo reintentos)
        const lastPayment = order.payments?.length
            ? order.payments[order.payments.length - 1]
            : null

        // Si hubo pago aprobado, el total "real" es lo que se cobró en la tarjeta (puede incluir interés).
        // Si no, mostramos el total de catálogo de la orden.
        const displayTotal = lastPayment?.amount ?? order.total    

        // Solo devolvemos lo necesario para mostrarle al cliente —
        // nada de datos internos sensibles
        return {
            id: order.id,
            state: order.state,
            total: displayTotal,
            catalogTotal: Number(order.total),
            shippingCost: order.shippingCost,
            shippingType: order.shippingType,
            deliveryType: order.deliveryType,
            streetName: order.streetName,
            streetNumber: order.streetNumber,
            floor: order.floor,
            apartment: order.apartment,
            city: order.city,
            provinceCode: order.provinceCode,
            zipCode: order.zipCode,
            agencyName: order.agencyName,            
            agencyAddress: order.agencyAddress,
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
                    cardBrand: lastPayment.cardBrand,
                } : null,
        }
    }

    async generateShippingLabel(orderId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if (order.shippingType !== shippingTypeEnum.CORREO_ARGENTINO) {
        throw new BadRequestException('Solo los envíos por Correo Argentino requieren etiqueta');
    }
    if (order.shippingImportedAt) {
        throw new BadRequestException('Esta orden ya tiene un envío importado');
    }

    const isSucursal = order.deliveryType === DeliveryType.SUCURSAL;

    const result = await this.correoArgentinoService.createShipment({
        extOrderId: order.id,
        orderNumber: order.id.slice(0, 8),
        recipient: {
            name: order.guestName ?? '',
            phone: order.guestPhone,
            email: order.guestEmail ?? '',
        },
        shipping: {
            deliveryType: isSucursal ? 'S' : 'D',
            agency: isSucursal ? (order.agencyCode ?? undefined) : undefined,
            address: {
                streetName: order.streetName ?? '',
                streetNumber: order.streetNumber ?? '',
                floor: order.floor ?? undefined,
                apartment: order.apartment ?? undefined,
                city: isSucursal ? (order.agencyCity ?? order.city) : order.city,
                provinceCode: order.provinceCode ?? '',
                postalCode: order.zipCode ?? '',
            },
            weight: order.packageWeight ?? 0,
            declaredValue: Number(order.total),
            height: order.packageHeight ?? 0,
            length: order.packageLength ?? 0,
            width: order.packageWidth ?? 0,
        },
    });

    order.shippingImportedAt = new Date(result.createdAt);
    return this.orderRepository.save(order);
}
}

