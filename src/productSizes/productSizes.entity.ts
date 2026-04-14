import { Products } from "../products/products.entity";
import { Sizes } from "../sizes/sizes.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'product_sizes' })
export class ProductSizes {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    stock: number;

    @ManyToOne(() => Products, (product) => product.productSizes)
    @JoinColumn({ name: 'productId' })
    product: Products;

    @ManyToOne(() => Sizes, (size) => size.productSizes)
    @JoinColumn({ name: 'sizeId' })
    size: Sizes;

}