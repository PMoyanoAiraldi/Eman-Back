import { SubCategories } from '../subCategories/subCategories.entity';
import { Products } from '../products/products.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum PackagingType { 
  BOLSA = 'BOLSA',
  CAJA = 'CAJA' 
}

@Entity({ name: 'categories' })
export class Categories {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false, unique: true})
  name: string;

  @Column({ default: true })
  state: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'enum', enum: PackagingType, default: PackagingType.BOLSA })
  packaging: PackagingType;

  @OneToMany(() => SubCategories, (subcategory) => subcategory.category)
  subcategories: SubCategories[];

  @OneToMany(() => Products, (product) => product.category)
  products: Products[];
}
