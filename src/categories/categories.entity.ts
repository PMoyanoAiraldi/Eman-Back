import { Products } from '../products/products.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'categories' })
export class Categories {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false})
  name: string;

  @Column({ default: true })
  state: boolean;

  @OneToMany(() => Products, (product) => product.category)
  products: Products[];
}
