import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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

    async create(createMediaContentDto: CreateMediaContentDto, file: Express.Multer.File): Promise<MediaContent> {
        if (!file) throw new BadRequestException('No se proporcionó imagen');
    
        const url = await this.cloudinaryService.uploadFile(
            file.buffer,
            'media',
            file.originalname
        );

        const media = this.mediaContentRepository.create({
            ...createMediaContentDto,
            url,
            order: createMediaContentDto.order ?? 0
        });

        return this.mediaContentRepository.save(media);
    }

    async update(id: string, updateMediaContentDto: UpdateMediaContentDto, file: Express.Multer.File): Promise<MediaContent> {
        const media = await this.findOne(id);

         // Si viene archivo nuevo, subimos y borramos el anterior
        if (file) {
            await this.cloudinaryService.deleteFile(media.url).catch(
                err => console.error('Error al eliminar imagen anterior:', err)
            );
            const url = await this.cloudinaryService.uploadFile(
                file.buffer,
                'media',
                file.originalname
            );
            media.url = url;
        }
        
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
