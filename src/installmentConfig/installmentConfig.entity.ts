import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'installment_config' })
export class InstallmentConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    installments: number;

    @Column({ default: false })
    isActive: boolean;

    @Column({ type: 'date' })
    validFrom: Date;

    @Column({ type: 'date' })
    validTo: Date;

    @CreateDateColumn()
    createdAt: Date;
}