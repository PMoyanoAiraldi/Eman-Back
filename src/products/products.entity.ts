import { SubCategories } from "../subCategories/subCategories.entity";
import { Brands } from "../brands/brands.entity";
import { Categories } from "../categories/categories.entity";
import { Images } from "../images/images.entity";
import { OrderDetail } from "../orderDetail/orderDetail.entity";
import { ProductSizes } from "../productSizes/productSizes.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductTypes } from "../productTypes/productTypes.entity";

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

    @Column({ length: 10, nullable: true })
    gender: string; 

    @Column({ default: false })
    isFeatured: boolean;

    @ManyToOne(() => Brands, (brand) => brand.products)
    @JoinColumn({ name: 'brandId' })
    brand: Brands;

    @ManyToOne(() => Categories, (category) => category.products)
    @JoinColumn({ name: 'categoryId' })
    category: Categories;

    @ManyToOne(() => SubCategories, (subcategory) => subcategory.products)
    @JoinColumn({ name: 'subcategoryId' })
    subcategory: SubCategories;

    @ManyToOne(() => ProductTypes, (productType) => productType.products)
    @JoinColumn({ name: 'typeId' })
    productType: ProductTypes;

    @OneToMany(() => Images, (image) => image.product)
    images: Images[];

    @OneToMany(() => ProductSizes, (productSize) => productSize.product)
    productSizes: ProductSizes[];

    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.product)
    orderDetail: OrderDetail[];

}