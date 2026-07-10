import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Images } from "./images.entity";
import { Repository } from "typeorm";
import { Products } from "src/products/products.entity";
import { CloudinaryService } from "src/file-upload/cloudinary.service";

@Injectable()
export class ImagesService {
    constructor(
        @InjectRepository(Images)
        private readonly imagesRepository: Repository<Images>,
        @InjectRepository(Products)
        private readonly productsRepository: Repository<Products>,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    async addImage(productId: string, file: Express.Multer.File): Promise<Images>{
        if (!file || !file.buffer || !file.originalname) {
            throw new Error('El archivo proporcionado no es válido');
        }

        const product = await this.productsRepository.findOne({ 
            where: { id: productId },
            relations: ['images']
            });
        if (!product) throw new NotFoundException('Producto no encontrado');

        const url = await this.cloudinaryService.uploadFile(
            file.buffer,
            'products',
            file.originalname
        )

        // Verificar que no exista ya esa URL para ese producto
        const existingImage = product.images.find(img => img.url === url);
        if (existingImage) {
            throw new BadRequestException('Esa imagen ya existe para este producto');
        }

        const isPrimary = product.images.length === 0;

        const newImage = this.imagesRepository.create({
            url,
            isPrimary,
            order: product.images.length,
            state: true,
            product
        });

        return await this.imagesRepository.save(newImage);
    }


    async replaceImage(file: Express.Multer.File, imageId: string): Promise<{ imgUrl: string }> {
        if (!file || !file.buffer || !file.originalname) {
            throw new Error('El archivo proporcionado no es válido');
        }

        const image = await this.imagesRepository.findOne({ where: { id: imageId } });
        if (!image) throw new NotFoundException('Imagen no encontrada');

        await this.cloudinaryService.deleteFile(image.url).catch(
            err => console.error('Error al eliminar imagen anterior:', err)
        );

        const url = await this.cloudinaryService.uploadFile(
            file.buffer,
            'products',
            file.originalname
        );

        image.url = url;
        await this.imagesRepository.save(image);

        return { imgUrl: url };
}

    async deleteImage(imageId: string): Promise<void> {
        const image = await this.imagesRepository.findOne({ 
            where: { id: imageId },
            relations: ['product', 'product.images']
        });
        if (!image) throw new NotFoundException('Imagen no encontrada');

        // 1. Borrar de Cloudinary primero
        await this.cloudinaryService.deleteFile(image.url);

        // 2. Si Cloudinary salió bien, recién ahí tocamos la DB
        // Si era primaria, asignamos la siguiente como primaria
        if (image.isPrimary) {
            const nextImage = image.product.images.find(
                img => img.id !== imageId && img.state
            );
            if (nextImage) {
                nextImage.isPrimary = true;
                await this.imagesRepository.save(nextImage);
            }
        }

        await this.imagesRepository.remove(image);
    }


    async setPrimary(imageId: string): Promise<Images> {
        const image = await this.imagesRepository.findOne({ 
            where: { id: imageId },
            relations: ['product', 'product.images']
        });
        if (!image) throw new NotFoundException('Imagen no encontrada');

        // Quitamos primaria a todas las imágenes del producto
        await this.imagesRepository.update(
            { product: { id: image.product.id } },
            { isPrimary: false }
        );

        // Marcamos la nueva primaria
        image.isPrimary = true;
        return await this.imagesRepository.save(image);
    }


    async getImagesByProduct(productId: string): Promise<Images[]> {
        return this.imagesRepository.find({
            where: { 
                product: { id: productId },
                state: true
            },
            order: { order: 'ASC' }
        });
    }

}
