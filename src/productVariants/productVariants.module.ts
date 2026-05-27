import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductVariants } from "./productVariants.entity";
import { Products } from "src/products/products.entity";
import { Sizes } from "src/sizes/sizes.entity";
import { ProductVariantsService } from "./productVariants.service";
import { ProductVariantsController } from "./productVariants.controller";
import { Colors } from "src/colors/colors.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariants, Products, Sizes, Colors])],
    providers: [ ProductVariantsService],
    controllers: [ProductVariantsController],
    exports: [ProductVariantsService]
})
export class ProductVariantsModule{}