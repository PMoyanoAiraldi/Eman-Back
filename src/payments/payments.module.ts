import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payments } from "./payments.entity";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { Order } from "src/order/order.entity";
import { EmailModule } from "src/email/email.module";

@Module({
    imports: [TypeOrmModule.forFeature([Payments, Order]), EmailModule],
    providers: [ PaymentsService],
    controllers: [PaymentsController],
    exports: [PaymentsService]
})
export class PaymentsModule{}