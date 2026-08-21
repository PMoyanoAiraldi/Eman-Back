import { Products } from "src/products/products.entity";
import { ShippingController } from "./shipping.controller";
import { ShippingService } from "./shipping.service";
import { CorreoArgentinoModule } from "src/correo-argentino/correo-argentino.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        CorreoArgentinoModule,
        TypeOrmModule.forFeature([Products]),
    ],
    controllers: [ShippingController],
    providers: [ShippingService],
    exports: [ShippingService], // lo va a necesitar OrderModule también
})
export class ShippingModule {}