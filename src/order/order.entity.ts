import { OrderDetail } from "../orderDetail/orderDetail.entity";
import { Payments } from "../payments/payments.entity";
import { Users } from "../users/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum shippingTypeEnum {
    COORDINADO = 'coordinado',
    CORREO_ARGENTINO = 'correo_argentino',
    RETIRO_EN_LOCAL = 'retiro_en_local'
}

export enum stateEnum{
    PENDIENTE = 'pendiente',
    CONFIRMADO = 'confirmado',
    ENVIADO = 'enviado',
    ENTREGADO = 'entregado',
    CANCELADO = 'cancelado'
}

export enum DeliveryType {
    DOMICILIO = 'domicilio',
    SUCURSAL = 'sucursal',
}


@Entity({ name: 'order' })
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, nullable: true })
    guestName?: string;

    @Column({ length: 255, nullable: true })
    guestEmail?: string;

    @Column({ length: 20, nullable: true })
    guestPhone?: string;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    streetName?: string | null;

    @Column({ type: 'varchar', length: 10, nullable: true })
    streetNumber?: string | null;

    @Column({ type: 'varchar', length: 10, nullable: true })
    floor?: string | null;

    @Column({ type: 'varchar', length: 10, nullable: true })
    apartment?: string | null;
    

    @Column({type: 'varchar', length: 255, nullable: false})
    city: string;

    @Column({ length: 1, nullable: true })
    provinceCode?: string; // solo aplica a correo_argentino, coordinado no lo necesita

    @Column({length: 255, default: 'Argentina'})
    country: string;

    @Column({ length: 10, nullable: true })
    zipCode: string;

    @Column({
    type: 'enum',
    enum: DeliveryType,
    nullable: true,
    })
    deliveryType: DeliveryType | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    agencyCode: string | null; // ej: "B0107" - obligatorio solo si deliveryType = SUCURSAL

    @Column({ type: 'varchar', length: 150, nullable: true })
    agencyName: string | null; // ej: "Monte Grande" - opcional, para mostrar en el panel sin re-consultar la API

    @Column({ type: 'varchar', length: 300, nullable: true })
    agencyAddress: string | null; // opcional, idem - útil para mostrar en el admin/email de confirmación sin llamar a /agencies de nuevo

    @Column({ type: 'varchar', length: 100, nullable: true })
    agencyCity: string | null;

    @Column({
        type: 'enum',
        enum: shippingTypeEnum,
        default: shippingTypeEnum.CORREO_ARGENTINO,
    })
    shippingType: shippingTypeEnum;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
        type: 'enum',
        enum: stateEnum,
        default: stateEnum.PENDIENTE,
    })
    state: stateEnum

    @Column({ type: 'timestamp', nullable: true })
    confirmationEmailSentAt: Date | null;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    discountAmount?: number; 

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    shippingCost?: number;

    @Column({ type: 'int', nullable: true })
    packageWeight?: number; // gramos

    @Column({ type: 'int', nullable: true })
    packageHeight?: number;

    @Column({ type: 'int', nullable: true })
    packageWidth?: number;

    @Column({ type: 'int', nullable: true })
    packageLength?: number;

    @Column({ type: 'timestamp', nullable: true })
    shippingImportedAt: Date | null;

    @ManyToOne(() => Users, (user) => user.orders, { nullable: true }) //para poder comprar sin registro del user
    @JoinColumn({ name: 'userId' })
    user: Users | null;

    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.orders)
    orderDetail: OrderDetail[];

    @OneToMany(() => Payments, (payment) => payment.order)
    payments: Payments[];
}