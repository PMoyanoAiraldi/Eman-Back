import { Colors } from "src/colors/colors.entity";
import { Products } from "../products/products.entity";
import { Sizes } from "../sizes/sizes.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderDetail } from "src/orderDetail/orderDetail.entity";

@Entity({ name: 'product_variants' })
export class ProductVariants {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: 0})
    stock: number;

    @ManyToOne(() => Products, (product) => product.variants)
    @JoinColumn({ name: 'productId' })
    product: Products;

    @ManyToOne(() => Sizes, (size) => size.variants)
    @JoinColumn({ name: 'sizeId' })
    size: Sizes;

    @ManyToOne(() => Colors, (color) => color.variants)
    @JoinColumn({ name: 'colorId' })
    color: Colors;

    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.variant)
    orderDetails: OrderDetail[];

}