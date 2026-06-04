import { ProductVariants } from "../productVariants/productVariants.entity";
import { Order } from "../order/order.entity";
import { Products } from "../products/products.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'order_detail' })
export class OrderDetail {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ length: 255 })
    productName: string;

    @ManyToOne(() => Order, (orders) => orders.orderDetail)
    @JoinColumn({ name: 'orderId' })
    orders: Order;

    @ManyToOne(() => Products, (product) => product.orderDetail)
    @JoinColumn({ name: 'productId' })
    product: Products;

    
    @ManyToOne(() => ProductVariants, (variant) => variant.orderDetails)
    @JoinColumn({ name: 'variantId' })
    variant: ProductVariants;
}
