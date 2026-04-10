import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'categories' })
export class Categories {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name: string;

  @Column()
  state: boolean;
}
