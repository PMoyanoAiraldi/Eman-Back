import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Products } from 'src/products/products.entity';
import { MediaContent, MediaType } from 'src/mediaContent/mediaContent.entity';
import { Images } from 'src/images/images.entity';
import { Categories } from 'src/categories/categories.entity';
import { SubCategories } from 'src/subCategories/subCategories.entity';

type EntityType = 'product'  | 'media' | 'category' | 'subcategory';

@Injectable()
export class FileUploadService {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        @InjectRepository(Products) 
        private readonly productsRepository: Repository<Products>,
        @InjectRepository(MediaContent)
        private readonly mediaContentRepository: Repository<MediaContent>,
        @InjectRepository(Images)
        private readonly imagesRepository: Repository<Images>,
        @InjectRepository(Categories)
        private readonly categoriesRepository: Repository<Categories>,
        @InjectRepository(SubCategories)
        private readonly subCategoriesRepository: Repository<SubCategories>,
    ){}

    async uploadFile(
        file: Express.Multer.File, 
        entityType: EntityType,
        entityId?: string,
        mediaType?: MediaType
    ): Promise<{ imgUrl: string }>{
    
        if (!file || !file.buffer || !file.originalname) {
            throw new Error('El archivo proporcionado no es válido');
        }

        if (!['product', 'media'].includes(entityType)) {
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
            case 'product':{
                if (!entityId) {
                    throw new Error('No se proporcionó un ID del producto.');
                }

                //  Actualizar directamente en el repositorio
                const product = await this.productsRepository.findOne({ 
                    where: { id: entityId },
                    relations: ['images']
                });

                if (!product) {
                    throw new NotFoundException('Producto no encontrado');
                }
            
                const isFirstImage = product.images.length === 0;

                const newImage = this.imagesRepository.create({
                    url,
                    isPrimary: isFirstImage, // solo es primaria si es la primera
                    order: product.images.length,
                    state: true,
                    product,
                });

                await this.imagesRepository.save(newImage);
                break;
            }
            case 'media': {
                // Si viene entityId, actualiza una existente
                // Si no, crea una nueva
                if (entityId) {
                    const media = await this.mediaContentRepository.findOne({
                        where: { id: entityId }
                    });
                    if (!media) throw new NotFoundException('MediaContent no encontrado');
                    
                    await this.cloudinaryService.deleteFile(media.url).catch(
                        err => console.error('Error al eliminar imagen anterior:', err)
                    );
                    
                    media.url = url;
                    await this.mediaContentRepository.save(media);
                } else {
                    // Crea nuevo registro — los demás campos los setea quien llame al endpoint
                    const newMedia = this.mediaContentRepository.create({ 
                        url,
                        type: mediaType 
                    });
                    await this.mediaContentRepository.save(newMedia);
                }
                break;
            }

            case 'category': {
                if (!entityId) throw new Error('No se proporcionó un ID de categoría.');
                
                const category = await this.categoriesRepository.findOne({ where: { id: entityId } });
                if (!category) throw new NotFoundException('Categoría no encontrada');
                
                // Si ya tenía imagen, borramos la anterior de Cloudinary
                if (category.imageUrl) {
                    await this.cloudinaryService.deleteFile(category.imageUrl).catch(
                        err => console.error('Error al eliminar imagen anterior:', err)
                    );
                }
                
                category.imageUrl = url;
                await this.categoriesRepository.save(category);
                break;
            }

            case 'subcategory': {
                if (!entityId) throw new Error('No se proporcionó un ID de subcategoría.');
                
                const subcategory = await this.subCategoriesRepository.findOne({ where: { id: entityId } });
                if (!subcategory) throw new NotFoundException('Subcategoría no encontrada');
                
                if (subcategory.imageUrl) {
                    await this.cloudinaryService.deleteFile(subcategory.imageUrl).catch(
                        err => console.error('Error al eliminar imagen anterior:', err)
                    );
                }
                
                subcategory.imageUrl = url;
                await this.subCategoriesRepository.save(subcategory);
                break;
            }

        default:
            throw new Error('Tipo de entidad no compatible');
        }
        //await this.productsRepository.updateProduct(productId, {imgUrl: url});
        return {imgUrl: url}
    }



    async replaceImage(
        file: Express.Multer.File,
        imageId: string
    ): Promise<{ imgUrl: string }> {

        if (!file || !file.buffer || !file.originalname) {
            throw new Error('El archivo proporcionado no es válido');
        }
        // Buscar la imagen existente
        const image = await this.imagesRepository.findOne({
            where: { id: imageId }
        });
        if (!image) throw new NotFoundException('Imagen no encontrada');

        // Borrar la vieja de Cloudinary
        await this.cloudinaryService.deleteFile(image.url).catch(
            err => console.error('Error al eliminar imagen anterior:', err)
        );

        // Subir la nueva
        const url = await this.cloudinaryService.uploadFile(
            file.buffer,
            'product',
            file.originalname
        );

        // Actualizar en BD
        image.url = url;
        await this.imagesRepository.save(image);

        return { imgUrl: url };
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

    private getFolderForEntityType(entityType: EntityType): string {
        switch (entityType) {
            case 'product':
                return 'product';
            case 'media':
                return 'media';
            case 'category':
                return 'category';
            case 'subcategory':
                return 'subcategory';
            default:
                throw new Error('Tipo de entidad no compatible');
        }
    }
}
