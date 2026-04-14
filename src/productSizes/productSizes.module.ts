import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductSizes } from "./productSizes.entity";
import { ProductSizesService } from "./productSizes.service";
import { ProductSizesController } from "./productSizes.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ProductSizes])],
    providers: [ ProductSizesService],
    controllers: [ProductSizesController],
    exports: [ProductSizesService]
})
export class ProductSizesModule{}