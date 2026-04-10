import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'brands' })
export class Brands {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name: string;

  @Column()
  state: boolean;
}
