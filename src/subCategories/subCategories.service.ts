import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SubCategories } from "./subCategories.entity";
import { Repository } from "typeorm";

@Injectable()
export class SubCategoriesService {
    constructor(
    @InjectRepository(SubCategories)
        private readonly subCategoriesRepository: Repository<SubCategories>,
    ) { }
}