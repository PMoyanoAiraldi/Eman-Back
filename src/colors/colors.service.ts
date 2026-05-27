import { InjectRepository } from "@nestjs/typeorm";
import { Colors } from "./colors.entity";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

@Injectable()
export class ColorsService {
    constructor(
    @InjectRepository(Colors)
        private readonly colorsRepository: Repository<Colors>,
    ) { }
}