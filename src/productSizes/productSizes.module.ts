import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductSizes } from "./productSizes.entity";
import { ProductSizesService } from "./productSizes.service";
import { ProductSizesController } from "./productSizes.controller";
import { Products } from "src/products/products.entity";
import { Sizes } from "src/sizes/sizes.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ProductSizes, Products, Sizes])],
    providers: [ ProductSizesService],
    controllers: [ProductSizesController],
    exports: [ProductSizesService]
})
export class ProductSizesModule{}