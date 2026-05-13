import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediaContent } from "./mediaContent.entity";
import { MediaContentService } from "./mediaContent.service";
import { MediaContentController } from "./mediaContent.controller";
import { CloudinaryService } from "src/file-upload/cloudinary.service";


@Module({
    imports: [TypeOrmModule.forFeature([MediaContent])],
    providers: [ MediaContentService, CloudinaryService],
    controllers: [MediaContentController],
    exports: [MediaContentService]
})
export class MediaContentModule{}