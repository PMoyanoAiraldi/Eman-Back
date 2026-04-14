import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Images } from "./images.entity";
import { Repository } from "typeorm";

@Injectable()
export class ImagesService {
    constructor(
    @InjectRepository(Images)
        private readonly imagesRepository: Repository<Images>,
    ) { }
}
