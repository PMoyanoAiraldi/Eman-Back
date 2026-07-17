import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum MediaType {
    HERO = 'hero',
    BANNER = 'banner',
    CATEGORY = 'category',
    FEATURED = 'featured',
}

export enum MediaSection {
    HOME = 'home',
    ABOUT = 'about',
    COLLECTION = 'collection',
}

@Entity({ name: 'media_content' })
export class MediaContent {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    url: string;

    @Column({ nullable: true, length: 100 })
    tag: string;              // "NUEVA COLECCIÓN", "SALE", "TEMPORADA 2025"

    @Column({ nullable: true, length: 150 })
    title: string;            // "Tu mejor versión"

    @Column({ nullable: true, length: 255 })
    subtitle: string;         // "Moda que te define"

    @Column({ nullable: true, length: 100 })
    ctaText: string;          // "Explorar"

    @Column({ nullable: true, length: 255 })
    ctaUrl: string;           // "/mujer"

    @Column({ type: 'varchar', default: 'center center' })
    focalPoint: string; // ej: "center 20%", "50% 30%"

    @Column({ type: 'enum', enum: MediaType })
    type: MediaType;

    @Column({ type: 'enum', enum: MediaSection, nullable: true })
    section: MediaSection;

    @Column({ nullable: true, length: 150 })
    altText: string;

    @Column({ default: 0 })
    order: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}