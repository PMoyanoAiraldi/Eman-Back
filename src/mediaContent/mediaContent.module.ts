import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediaContent } from "./mediaContent.entity";
import { MediaContentService } from "./mediaContent.service";
import { MediaContentController } from "./mediaContent.controller";


@Module({
    imports: [TypeOrmModule.forFeature([MediaContent])],
    providers: [ MediaContentService],
    controllers: [MediaContentController],
    exports: [MediaContentService]
})
export class MediaContentModule{}