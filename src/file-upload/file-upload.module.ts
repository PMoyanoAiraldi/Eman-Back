import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { CloudinaryService } from './cloudinary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/users.entity';
import { UserService } from 'src/user/users.service';
import { LineaService } from 'src/linea/linea.service';
import { Products } from 'src/product/product.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Products]),
  
  ],
  providers: [FileUploadService,UserService, CloudinaryService,  LineaService],
  controllers: [],
  exports: [FileUploadService,  CloudinaryService]
})

export class FileUploadModule {}
