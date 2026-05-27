// colors/colors.entity.ts
import { ProductVariants } from 'src/productVariants/productVariants.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'colors' })
export class Colors {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, nullable: false })
    name: string;           // "Negro", "Blanco", "Rojo"

    @Column({ length: 7, nullable: false })
    hex: string;            // "#1a1a1a", "#ffffff", "#e63946"

    @Column({ default: true })
    state: boolean;

    @OneToMany(() => ProductVariants, (variant) => variant.color)
    variants: ProductVariants[];
}