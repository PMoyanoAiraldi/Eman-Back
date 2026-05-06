import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubCategories } from "./subCategories.entity";
import { SubCategoriesService } from "./subCategories.service";
import { SubCategoriesController } from "./subCategories.controller";
import { FileUploadService } from "src/file-upload/file-upload.service";
import { CloudinaryService } from "src/file-upload/cloudinary.service";
import { Products } from "src/products/products.entity";
import { MediaContent } from "src/mediaContent/mediaContent.entity";
import { Images } from "src/images/images.entity";
import { Categories } from "src/categories/categories.entity";

@Module({
    imports: [TypeOrmModule.forFeature([SubCategories, Products, MediaContent, Images, Categories])],
    providers: [ SubCategoriesService, FileUploadService, CloudinaryService],
    controllers: [SubCategoriesController],
    exports: [SubCategoriesService]
})
export class SubCategoriesModule{}