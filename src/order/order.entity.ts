import { OrderDetail } from "../orderDetail/orderDetail.entity";
import { Payments } from "../payments/payments.entity";
import { Users } from "../users/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum shippingTypeEnum {
    COORDINADO = 'coordinado',
    CORREO_ARGENTINO = 'correo_argentino',
}

export enum stateEnum{
    PENDIENTE = 'pendiente',
    CONFIRMADO = 'confirmado',
    ENVIADO = 'enviado',
    ENTREGADO = 'entregado',
    CANCELADO = 'cancelado'
}


@Entity({ name: 'order' })
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @Column({ length: 255, nullable: false})
    address: string;

    @Column({ length: 255, nullable: false})
    city: string;

    @Column({length: 255, default: 'Argentina'})
    country: string;

    @Column()
    zipCode: number;

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

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    discountAmount?: number; 

    @ManyToOne(() => Users, (user) => user.orders)
    @JoinColumn({ name: 'userId' })
    user: Users;

    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.orders)
    orderDetail: OrderDetail[];

    @OneToMany(() => Payments, (payment) => payment.order)
    payments: Payments[];
}