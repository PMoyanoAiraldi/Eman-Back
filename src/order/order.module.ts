import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./order.entity";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { OrderDetail } from "src/orderDetail/orderDetail.entity";
import { ProductVariants } from "src/productVariants/productVariants.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderDetail, ProductVariants])],
    providers: [ OrderService],
    controllers: [OrderController],
    exports: [OrderService]
})
export class OrderModule{}