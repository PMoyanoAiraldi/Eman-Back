import { Order } from "../order/order.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum rolEnum {
    ADMIN = 'admin',
    CLIENTE = 'cliente',
}


@Entity({ name: 'users' })
export class Users {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, nullable: false})
    name: string;

    @Column({ length: 255, nullable: false})
    address: string;

    @Column({ length: 255, nullable: false})
    city: string

    @Column({ length: 20, nullable: false})
    phone: string;

    @Column({ nullable: false})
    email: string;

    @Column({ nullable: false})
    password: string;

    @Column({ default: true })
    state: boolean;

    @Column({
        type: 'enum',
        enum: rolEnum,
        default: rolEnum.CLIENTE,
    })
    rol: rolEnum;

    @Column({ type: 'varchar', nullable: true, default: null })
    refreshToken: string | null;

    @Column({ type: 'timestamp', nullable: true, default: null })
    refreshTokenExpiry: Date | null;

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];
}