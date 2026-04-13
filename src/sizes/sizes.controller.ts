import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SizesService } from "./sizes.service";

@ApiTags('Sizes')
@Controller("sizes")
export class SizesController {
    constructor(
        private readonly sizesService: SizesService,
    ) { }
}