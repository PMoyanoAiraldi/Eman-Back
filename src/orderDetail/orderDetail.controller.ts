import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { OrderDetailService } from "./orderDetail.service";

@ApiTags('Order_detail')
@Controller("order_detail")
export class OrderDetailController {
    constructor(
        private readonly orderDetailService: OrderDetailService,
    ) { }
}