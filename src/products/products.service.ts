import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { Products } from "./products.entity";


@Injectable()
export class ProductsService {
    constructor(
    @InjectRepository(Products)
        private readonly productRepository: Repository<Products>,
    ) { }
}