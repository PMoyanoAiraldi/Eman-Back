import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeliveryType, invoiceStatusEnum, Order, shippingTypeEnum, stateEnum } from "./order.entity";
import { DataSource, Repository } from "typeorm";
import { OrderDetail } from "src/orderDetail/orderDetail.entity";
import { ProductVariants } from "src/productVariants/productVariants.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { EmailService } from "src/email/email.service";
import { ShippingService } from "src/shipping/shipping.service";
import { CorreoArgentinoService } from "src/correo-argentino/correo-argentino.service";
import { ConfigService } from '@nestjs/config';
import { Users } from "src/users/users.entity";
import { CloudinaryService } from "src/file-upload/cloudinary.service";

export interface OrderFilters {
    states?: stateEnum[];
    shippingTypes?: shippingTypeEnum[];
    labelStatuses?: ('generated' | 'pending' | 'na')[];
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}


@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(Users)               
        private readonly usersRepository: Repository<Users>,
        private dataSource: DataSource,
        private emailService: EmailService,
        private readonly shippingService: ShippingService,
        private readonly correoArgentinoService: CorreoArgentinoService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly config: ConfigService
    ) { }

    async createOrder(createOrderDto: CreateOrderDto, userId: string | null): Promise<Order> {
        return await this.dataSource.transaction(async (manager) => { // <- transaction: grupo de operaciones de base de datos que se ejecutan todas juntas o ninguna 

        // 1. Validar variantes, stock, y calcular subtotal con el precio REAL (no el del DTO)
        let subtotal = 0
        const variantsToUpdate: { variant: ProductVariants; newStock: number; realUnitPrice: number }[] = []

        for (const item of createOrderDto.items) {
            const variant = await manager.findOne(ProductVariants, {
                where: { id: item.variantId },
                relations: ['product'],
            })
            if (!variant) {
                throw new NotFoundException(`Variante ${item.variantId} no encontrada`)
            }
            if (variant.stock < item.quantity) {
                throw new BadRequestException(
                    `Stock insuficiente para "${item.productName}". Stock disponible: ${variant.stock}`
                )
            }
            const realUnitPrice = variant.product.price

            variantsToUpdate.push({ variant, newStock: variant.stock - item.quantity, realUnitPrice })
            subtotal += realUnitPrice * item.quantity
        }

        // 2.5. Calcular peso/dimensiones y cotizar el envío real (solo Correo Argentino)
        const isSucursal = createOrderDto.shippingType === shippingTypeEnum.CORREO_ARGENTINO
            && createOrderDto.deliveryType === DeliveryType.SUCURSAL;

        let packageData: Partial<Order> = {}
        let shippingCost = 0 // default: Coordinado/Retiro

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

            const originPostalCode = this.config.getOrThrow<string>('CORREO_SENDER_POSTAL_CODE')

            const rates = await this.correoArgentinoService.getRates({
                postalCodeOrigin: originPostalCode,
                postalCodeDestination: createOrderDto.zipCode,
                weight: pkg.weight,
                height: pkg.height,
                width: pkg.width,
                length: pkg.length,
                deliveredType: isSucursal ? 'S' : 'D',
            })
            const rate = rates.find(r => r.deliveredType === (isSucursal ? 'S' : 'D'))
            if (!rate) {
                throw new BadRequestException('No se pudo cotizar el envío para ese código postal')
            }
            shippingCost = rate.price
        }

        
        

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
            const { variant, newStock, realUnitPrice  } = variantsToUpdate[i]
            
        variant.stock = newStock
        await manager.save(ProductVariants, variant)

        // Crear el detalle de la orden
        const detail = manager.create(OrderDetail, {
            orders:      savedOrder,
            product:     { id: item.productId },
            variant:     { id: item.variantId },
            productName: item.productName,
            quantity:    item.quantity,
            unitPrice:   realUnitPrice,
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

    async getAllOrders(filters: OrderFilters = {}): Promise<Order[]> {
        const query = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.orderDetail', 'orderDetail')
            .leftJoinAndSelect('orderDetail.product', 'product')
            .leftJoinAndSelect('orderDetail.variant', 'variant')
            .orderBy('order.createdAt', 'DESC');

        if (filters.states?.length) {
            query.andWhere('order.state IN (:...states)', { states: filters.states });
        }

        if (filters.shippingTypes?.length) {
            query.andWhere('order.shippingType IN (:...shippingTypes)', { shippingTypes: filters.shippingTypes });
        }

        if (filters.labelStatuses?.length) {
            const conditions: string[] = [];
            if (filters.labelStatuses.includes('generated')) {
                conditions.push('(order.shippingType = :correoArg AND order.shippingImportedAt IS NOT NULL AND order.state != :cancelado)');
            }
            if (filters.labelStatuses.includes('pending')) {
                conditions.push('(order.shippingType = :correoArg AND order.shippingImportedAt IS NULL AND order.state != :cancelado)');
            }
            if (filters.labelStatuses.includes('na')) {
                conditions.push('(order.shippingType != :correoArg OR order.state = :cancelado)');
            }
            if (conditions.length) {
                query.andWhere(`(${conditions.join(' OR ')})`, {
                    correoArg: shippingTypeEnum.CORREO_ARGENTINO,
                    cancelado: stateEnum.CANCELADO,
                });
            }
        }

    if (filters.dateFrom) {
        query.andWhere('order.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
        query.andWhere('order.createdAt <= :dateTo', { dateTo: `${filters.dateTo} 23:59:59` });
    }

    if (filters.search) {
        query.andWhere('(order.guestName ILIKE :search OR order.guestEmail ILIKE :search)', {
            search: `%${filters.search}%`,
        });
    }

    return query.getMany();
    
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

    async updateState(id: string, state: stateEnum, trackingNumber?: string): Promise<Order> {
        const order = await this.getOrderById(id)
        if (state === stateEnum.ENVIADO && order.shippingType === shippingTypeEnum.CORREO_ARGENTINO &&
        !trackingNumber &&
        !order.trackingNumber
    ) {
        throw new BadRequestException('Necesitás cargar el número de seguimiento para marcar este pedido como enviado');
    }

        order.state = state 

        if (trackingNumber) {
        order.trackingNumber = trackingNumber
    }
        
        const updatedOrder = await this.orderRepository.save(order)

        // Solo avisamos por mail si pasa a "Enviado" y es Correo Argentino.
        // Coordinado y Retiro se resuelven por WhatsApp / entrega en persona,
        // esos casos van directo a "Entregado" sin pasar por acá.
        if (state === stateEnum.ENVIADO && order.shippingType === shippingTypeEnum.CORREO_ARGENTINO) {
            const { invoiceSent } = await this.emailService.sendDispatchNotification(order)
            if (invoiceSent) {
                order.invoiceStatus = invoiceStatusEnum.ENVIADA
                await this.orderRepository.save(order)
            }
        }

        return updatedOrder
    }

    async uploadInvoice(orderId: string, file: Express.Multer.File): Promise<Order> {
        if (!file) throw new BadRequestException('No se recibió ningún archivo');
        if (file.mimetype !== 'application/pdf') {
            throw new BadRequestException('La factura debe ser un archivo PDF');
        }

        const order = await this.getOrderById(orderId);
        const alreadySent = order.invoiceStatus === invoiceStatusEnum.ENVIADA;

        const url = await this.cloudinaryService.uploadFile(file.buffer, 'invoices', file.originalname);
        order.invoiceUrl = url;

         // Si ya se había enviado una factura antes (ej: ahora sube una NC),
        // NUNCA autoenviamos. Queda en "lista" esperando un click explícito.
        if (alreadySent) {
            order.invoiceStatus = invoiceStatusEnum.LISTA;
            await this.orderRepository.save(order);
            return order;
        }

        order.invoiceStatus = invoiceStatusEnum.LISTA;
        await this.orderRepository.save(order);

        const shouldSendNow =
            order.shippingType === shippingTypeEnum.CORREO_ARGENTINO
            ? !!order.trackingNumber
            : [stateEnum.ENVIADO, stateEnum.ENTREGADO].includes(order.state);

        // Si el pedido YA fue despachado, la mandamos ahora mismo aparte
        if (shouldSendNow) {
            const { invoiceSent } = await this.emailService.sendInvoiceEmail(order);
            if (invoiceSent) {
                order.invoiceStatus = invoiceStatusEnum.ENVIADA;
                await this.orderRepository.save(order);
            }
        }

        return order;
    }

    // Para el primer envío manual o para reenvíos/NC
    async sendInvoiceManually(orderId: string): Promise<Order> {
        const order = await this.getOrderById(orderId);
        if (!order.invoiceUrl) {
            throw new BadRequestException('Esta orden no tiene ninguna factura subida');
        }

        const { invoiceSent } = await this.emailService.sendInvoiceEmail(order);
        if (invoiceSent) {
            order.invoiceStatus = invoiceStatusEnum.ENVIADA;
            await this.orderRepository.save(order);
        }
        return order;
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

         // Si es guest, chequeamos si ese email ya tiene cuenta en otro lado
        let guestEmailHasAccount = false
        if (!order.user && order.guestEmail) {
            const existingUser = await this.usersRepository.findOne({
                where: { email: order.guestEmail },
                select: ['id'], // no necesitamos traer el resto de sus datos
            })
            guestEmailHasAccount = !!existingUser
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
            hasAccount: !!order.user, // si ya tiene user asociado, no mostrar CTA
            guestEmailHasAccount,
             // solo mandamos estos datos si es guest, para no exponerlos de más
            guestName: order.user ? undefined : order.guestName,
            guestEmail: order.user ? undefined : order.guestEmail,
            guestPhone: order.user ? undefined : order.guestPhone, 
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

async cancelOrder(id: string): Promise<{ message: string }> {
    const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['orderDetail', 'orderDetail.variant'],
    });
    if (!order) throw new NotFoundException(`Orden con ID ${id} no encontrada`);

    // Idempotente: si ya estaba cancelada (por ejemplo, el cliente clickeó "Volver" dos veces), no reponemos stock de nuevo
    if (order.state === stateEnum.CANCELADO) {
        return { message: 'La orden ya estaba cancelada' };
    }

    if (order.state !== stateEnum.PENDIENTE) {
        throw new BadRequestException('Solo se pueden cancelar órdenes pendientes');
    }

    await this.dataSource.transaction(async (manager) => {
        for (const detail of order.orderDetail) {
            const variant = await manager.findOne(ProductVariants, {
                where: { id: detail.variant.id },
            });
            if (variant) {
                variant.stock += detail.quantity;
                await manager.save(ProductVariants, variant);
            }
        }
        await manager.update(Order, order.id, { state: stateEnum.CANCELADO });
    });

    return { message: 'Orden cancelada y stock repuesto' };
}
}

