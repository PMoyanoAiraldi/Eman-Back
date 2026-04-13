import { InjectRepository } from "@nestjs/typeorm";
import { Sizes } from "./sizes.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SizesService {
    constructor(
    @InjectRepository(Sizes)
        private readonly sizesRepository: Repository<Sizes>,
    ) { }
}