import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sizes' })
export class Sizes {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name: string;

  @Column()
  state: boolean;
}
