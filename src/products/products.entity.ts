import { Brands } from "../brands/brands.entity";
import { Categories } from "../categories/categories.entity";
import { Images } from "../images/images.entity";
import { OrderDetail } from "../orderDetail/orderDetail.entity";
import { ProductSizes } from "../productSizes/productSizes.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'products' })
export class Products {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({ length: 255, nullable: false})
    name: string;

    @Column({ length: 255, nullable: false})
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ default: true })
    state: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Brands, (brand) => brand.products)
    @JoinColumn({ name: 'brandId' })
    brand: Brands;

    @ManyToOne(() => Categories, (category) => category.products)
    @JoinColumn({ name: 'categoryId' })
    category: Categories;

    @OneToMany(() => Images, (image) => image.product)
    images: Images[];

    @OneToMany(() => ProductSizes, (productSize) => productSize.product)
    productSizes: ProductSizes[];

    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.product)
    orderDetail: OrderDetail[];

}