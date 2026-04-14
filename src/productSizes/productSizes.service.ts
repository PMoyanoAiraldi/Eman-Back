import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ProductSizes } from "./productSizes.entity";

@Injectable()
export class ProductSizesService {
    constructor(
    @InjectRepository(ProductSizes)
        private readonly productSizesRepository: Repository<ProductSizes>,
    ) { }
}