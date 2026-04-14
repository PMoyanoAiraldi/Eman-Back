import { OrderDetail } from '../orderDetail/orderDetail.entity';
import { ProductSizes } from '../productSizes/productSizes.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sizes' })
export class Sizes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: false})
  name: string;

  @Column({ default: true })
  state: boolean;

  @OneToMany(() => ProductSizes, (productSize) => productSize.size)
  productSizes: ProductSizes[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.size)
  orderDetail: OrderDetail[];
}
