import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubCategories } from "./subCategories.entity";
import { SubCategoriesService } from "./subCategories.service";
import { SubCategoriesController } from "./subCategories.controller";

@Module({
    imports: [TypeOrmModule.forFeature([SubCategories])],
    providers: [ SubCategoriesService],
    controllers: [SubCategoriesController],
    exports: [SubCategoriesService]
})
export class SubCategoriesModule{}