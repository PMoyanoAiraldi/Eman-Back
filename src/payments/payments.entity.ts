import { Order } from "../order/order.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum methodEnum {
    TARJETA_CREDITO = 'tarjeta_credito',
    TARJETA_DEBITO = 'tarjeta_debito',
    TRANSFERENCIA = 'transferencia'
}

export enum statusEnum {
    PENDIENTE = 'pendiente',
    APROBADO = 'aprobado',
    RECHAZADO = 'rechazado',
    REEMBOLSADO = 'reembolsado'
}


@Entity({ name: 'payments' })
export class Payments {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: methodEnum,
        default: methodEnum.TARJETA_CREDITO,
    })
    method: methodEnum

    @Column({
        type: 'enum',
        enum: statusEnum,
        default: statusEnum.PENDIENTE,
    })
    status: statusEnum;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    installments: number;

    @Column('decimal', { precision: 10, scale: 2 })
    installmentsAmount: number;

    @Column({ length: 255, nullable: true }) // nullable porque al crear el pago todavía no existe
    transactionId: string;

    @Column({ nullable: true, type: 'date'})
    paidAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Order, (order) => order.payments)
    @JoinColumn({ name: 'orderId' })
    order: Order;
}