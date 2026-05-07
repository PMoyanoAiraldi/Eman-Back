import { SubCategories } from '../subCategories/subCategories.entity';
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

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @OneToMany(() => SubCategories, (subcategory) => subcategory.category)
  subcategories: SubCategories[];

  @OneToMany(() => Products, (product) => product.category)
  products: Products[];
}
