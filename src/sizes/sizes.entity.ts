import { ProductVariants } from '../productVariants/productVariants.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sizes' })
export class Sizes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false})
  name: string;

  @Column({ default: true })
  state: boolean;

  @OneToMany(() => ProductVariants, (variant) => variant.size)
  variants: ProductVariants[];

}
