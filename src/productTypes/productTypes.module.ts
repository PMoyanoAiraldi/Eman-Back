import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductTypes } from "./productTypes.entity";
import { ProductTypesService } from "./productTypes.service";
import { ProductTypesController } from "./productTypes.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ProductTypes])],
    providers: [ ProductTypesService],
    controllers: [ProductTypesController],
    exports: [ProductTypesService]
})
export class ProductTypesModule{}