import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProductSizesService } from "./productSizes.service";

@ApiTags('Product_sizes')
@Controller("product_sizes")
export class ProductSizesController {
    constructor(
        private readonly productSizeService: ProductSizesService,
    ) { }
}