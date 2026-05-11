import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { CloudinaryService } from './cloudinary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from 'src/products/products.entity';
import { FileUploadController } from './file-upload.controller';
import { Images } from 'src/images/images.entity';
import { MediaContent } from 'src/mediaContent/mediaContent.entity';
import { SubCategories } from 'src/subCategories/subCategories.entity';
import { Categories } from 'src/categories/categories.entity';
import { ImagesService } from 'src/images/images.service';



@Module({
  imports: [
    TypeOrmModule.forFeature([Products, Images, MediaContent, SubCategories, Categories]),
  
  ],
  providers: [FileUploadService, CloudinaryService, ImagesService],
  controllers: [FileUploadController],
  exports: [FileUploadService,  CloudinaryService]
})

export class FileUploadModule {}
