import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Products } from "./products.entity";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { Brands } from "src/brands/brands.entity";
import { Categories } from "src/categories/categories.entity";
import { SubCategories } from "src/subCategories/subCategories.entity";
import { ProductTypes } from "src/productTypes/productTypes.entity";


@Module({
    imports: [TypeOrmModule.forFeature([Products, Brands, Categories, SubCategories, ProductTypes])],
    providers: [ ProductsService],
    controllers: [ProductsController],
    exports: [ProductsService]
})
export class ProductsModule{}