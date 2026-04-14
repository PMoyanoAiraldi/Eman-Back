import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payments } from "./payments.entity";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Payments])],
    providers: [ PaymentsService],
    controllers: [PaymentsController],
    exports: [PaymentsService]
})
export class PaymentsModule{}