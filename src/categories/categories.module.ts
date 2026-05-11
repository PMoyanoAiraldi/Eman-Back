import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Categories } from './categories.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { CloudinaryService } from 'src/file-upload/cloudinary.service';
import { Products } from 'src/products/products.entity';
import { MediaContent } from 'src/mediaContent/mediaContent.entity';
import { Images } from 'src/images/images.entity';
import { SubCategories } from 'src/subCategories/subCategories.entity';
import { ImagesService } from 'src/images/images.service';

@Module({
    imports: [TypeOrmModule.forFeature([Categories, Products, MediaContent, Images, SubCategories])],
    providers: [ CategoriesService, FileUploadService, CloudinaryService, ImagesService],
    controllers: [CategoriesController],
    exports: [CategoriesService]
})
export class CategoriesModule{}