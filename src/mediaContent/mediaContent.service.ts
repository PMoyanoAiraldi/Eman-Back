import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MediaContent, MediaType } from "./mediaContent.entity";
import { Repository } from "typeorm";
import { CreateMediaContentDto } from "./dto/create-mediaContent.dto";
import { UpdateMediaContentDto } from "./dto/update-mediaContent.dto";
import { CloudinaryService } from "src/file-upload/cloudinary.service";

@Injectable()
export class MediaContentService {
    constructor(
    @InjectRepository(MediaContent)
        private readonly mediaContentRepository: Repository<MediaContent>,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async findAll(): Promise<MediaContent[]> {
        return this.mediaContentRepository.find({
            order: { order: 'ASC' }
        });
    }

    async findByType(type: MediaType): Promise<MediaContent[]> {
        return this.mediaContentRepository.find({
            where: { type, isActive: true },
            order: { order: 'ASC' }
        });
    }

    async findOne(id: string): Promise<MediaContent> {
        const media = await this.mediaContentRepository.findOne({
            where: { id }
        });
        if (!media) throw new NotFoundException('MediaContent no encontrado');
        return media;
    }

    async create(createMediaContentDto: CreateMediaContentDto): Promise<MediaContent> {
        const media = this.mediaContentRepository.create(createMediaContentDto);

        return this.mediaContentRepository.save(media);
    }

    async update(id: string, updateMediaContentDto: UpdateMediaContentDto): Promise<MediaContent> {
        const media = await this.findOne(id);
        Object.assign(media, updateMediaContentDto);
        return this.mediaContentRepository.save(media);
    }


    async toggleActive(id: string): Promise<MediaContent> {
        const media = await this.findOne(id);
        media.isActive = !media.isActive;
        return this.mediaContentRepository.save(media);
    }

    async remove(id: string): Promise<{ message: string }> {
        const media = await this.findOne(id);

        await this.cloudinaryService.deleteFile(media.url).catch(
                err => console.error('Error al eliminar imagen de Cloudinary:', err)
            );

        await this.mediaContentRepository.remove(media);
        return { message: 'MediaContent eliminado correctamente' };
    }
}
