import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./order.entity";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { OrderDetail } from "src/orderDetail/orderDetail.entity";
import { ProductVariants } from "src/productVariants/productVariants.entity";
import { EmailModule } from "src/email/email.module";
import { ShippingService } from "src/shipping/shipping.service";
import { Products } from "src/products/products.entity";
import { CorreoArgentinoService } from "src/correo-argentino/correo-argentino.service";
import { HttpModule } from '@nestjs/axios';
import { Users } from "src/users/users.entity";

@Module({
    imports: [HttpModule,TypeOrmModule.forFeature([Order, OrderDetail, ProductVariants, Products, Users]), EmailModule],
    providers: [ OrderService, ShippingService, CorreoArgentinoService],
    controllers: [OrderController],
    exports: [OrderService]
})
export class OrderModule{}