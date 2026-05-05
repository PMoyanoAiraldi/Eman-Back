import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductTypes } from "./productTypes.entity";
import { Repository } from "typeorm";

@Injectable()
export class ProductTypesService {
    constructor(
    @InjectRepository(ProductTypes)
        private readonly productTypesRepository: Repository<ProductTypes>,
    ) { }
}