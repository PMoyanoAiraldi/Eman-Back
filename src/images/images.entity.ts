import { Products } from "../products/products.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'images' })
export class Images {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, nullable: true})
    url: string;

    @Column({ default: false }) //la mayoria de las imagenes no son primarias
    isPrimary: boolean;

    @Column()
    order: number;

    @Column({ default: true })
    state: boolean;

    @ManyToOne(() => Products, (product) => product.images)
    @JoinColumn({ name: 'productId' })
    product: Products;
}