import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class SiteSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    maintenanceMode: boolean;

    @UpdateDateColumn()
    updatedAt: Date;
}