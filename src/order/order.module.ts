import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./order.entity";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { OrderDetail } from "src/orderDetail/orderDetail.entity";
import { ProductVariants } from "src/productVariants/productVariants.entity";
import { EmailModule } from "src/email/email.module";

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderDetail, ProductVariants]), EmailModule],
    providers: [ OrderService],
    controllers: [OrderController],
    exports: [OrderService]
})
export class OrderModule{}