import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProductTypesService } from "./productTypes.service";

@ApiTags('ProductTypes')
@Controller("product_types")
export class ProductTypesController {
    constructor(
        private readonly productTypesService: ProductTypesService,
    ) { }
}