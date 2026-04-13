import { Brands } from "src/brands/brands.entity";
import { Categories } from "src/categories/categories.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
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


}