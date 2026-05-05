import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SubCategoriesService } from "./subCategories.service";

@ApiTags('SubCategories')
@Controller("sub_categories")
export class SubCategoriesController {
    constructor(
        private readonly subCategoriesService: SubCategoriesService,
    ) { }
}