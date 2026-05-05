import { Products } from '../products/products.entity';
import { Categories } from '../categories/categories.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'subcategories' })
export class SubCategories {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, nullable: false })
    name: string;

    @Column({ default: true })
    state: boolean;

    @Column({ length: 500, nullable: true })
    imageUrl: string;

    @ManyToOne(() => Categories, (category) => category.subcategories)
    @JoinColumn({ name: 'categoryId' })
    category: Categories;

    @OneToMany(() => Products, (product) => product.subcategory)
    products: Products[];
}