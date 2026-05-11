import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Images } from "./images.entity";
import { ImagesService } from "./images.service";
import { ImagesController } from "./images.controller";
import { Products } from "src/products/products.entity";
import { CloudinaryService } from "src/file-upload/cloudinary.service";

@Module({
    imports: [TypeOrmModule.forFeature([Images, Products])],
    providers: [ ImagesService, CloudinaryService],
    controllers: [ImagesController],
    exports: [ImagesService]
})
export class ImagesModule{}