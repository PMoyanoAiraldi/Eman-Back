import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Images } from "./images.entity";
import { ImagesService } from "./images.service";
import { ImagesController } from "./images.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Images])],
    providers: [ ImagesService],
    controllers: [ImagesController],
    exports: [ImagesService]
})
export class ImagesModule{}