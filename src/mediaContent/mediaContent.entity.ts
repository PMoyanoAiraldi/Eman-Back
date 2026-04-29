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