import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { CloudinaryService } from './cloudinary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from 'src/products/products.entity';
import { FileUploadController } from './file-upload.controller';
import { Images } from 'src/images/images.entity';
import { MediaContent } from 'src/mediaContent/mediaContent.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([Products, Images, MediaContent]),
  
  ],
  providers: [FileUploadService, CloudinaryService],
  controllers: [FileUploadController],
  exports: [FileUploadService,  CloudinaryService]
})

export class FileUploadModule {}
