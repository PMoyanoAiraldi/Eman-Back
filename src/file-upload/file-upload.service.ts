import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Products } from 'src/products/products.entity';
import { MediaContent } from 'src/mediaContent/mediaContent.entity';

type EntityType = 'product'  | 'media';

@Injectable()
export class FileUploadService {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        @InjectRepository(Products) 
        private readonly productsRepository: Repository<Products>,
        @InjectRepository(MediaContent)
        private readonly mediaContentRepository: Repository<MediaContent>
    ){}

    async uploadFile(
        file: Express.Multer.File, 
        entityType: EntityType,
        entityId?: string
    ): Promise<{ imgUrl: string }>{
    
        if (!file || !file.buffer || !file.originalname) {
            throw new Error('El archivo proporcionado no es válido');
        }

        if (!['product', 'linea'].includes(entityType)) {
            throw new Error('El tipo de entidad proporcionado no es válido');
        }

        // Determinamos la carpeta según el tipo de entidad
        const folder = this.getFolderForEntityType(entityType);
        console.log(`Folder generado para ${entityType}: ${folder}`);


        const url = await this.cloudinaryService.uploadFile(
            file.buffer,
            folder,
            file.originalname
        );
        console.log(`Archivo subido a ${url}`);

        // Actualizar la URL de la imagen en la entidad correspondiente usando los servicios
        switch (entityType) {
            case 'product':
                if (!entityId) {
                    throw new Error('No se proporcionó un ID del producto para actualizar.');
                }

                //  Actualizar directamente en el repositorio
                const product = await this.productsRepository.findOne({ 
                    where: { id: entityId } 
                });

            if (!product) {
                throw new Error('Producto no encontrado');
            }
            
           // Eliminar la imagen anterior si existe
                if (product.imgUrl && product.imgUrl !== 'default-image-url.jpg') {
                    try {
                        await this.cloudinaryService.deleteFile(product.imgUrl);
                    } catch (error) {
                        console.error('Error al eliminar imagen anterior:', error);
                    }
                }

                // Actualizar solo la URL de la imagen
                product.imgUrl = url;
                await this.productsRepository.save(product);
                console.log("Imagen del producto actualizada", product);
                break;

        case 'linea':
            // Valida si `entityId` está presente
                if (!entityId) {
                    throw new Error('No se proporcionó un ID de la linea para actualizar.');
                }

            await this.lineaService.update(entityId, { image: url });
            break;

        default:
            throw new Error('Tipo de entidad no compatible');
        }
        //await this.productsRepository.updateProduct(productId, {imgUrl: url});
        return {imgUrl: url}
    }

    // Función para eliminar un archivo
    async deleteFile(publicId: string): Promise<void> {
        try {
            await this.cloudinaryService.deleteFile(publicId);  // Utilizando el servicio de Cloudinary
        } catch (error) {
            console.error('Error al eliminar el archivo de Cloudinary:', error);
            throw new InternalServerErrorException('Error al eliminar el archivo de Cloudinary');
        }
    }

    private getFolderForEntityType(entityType: string): string {
        switch (entityType) {
            case 'product':
                return 'product';
            case 'linea':
                return 'linea';
            default:
                throw new Error('Tipo de entidad no compatible');
        }
    }
}
