import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MediaContent } from "./mediaContent.entity";
import { Repository } from "typeorm";

@Injectable()
export class MediaContentService {
    constructor(
    @InjectRepository(MediaContent)
        private readonly mediaContentRepository: Repository<MediaContent>,
    ) { }
}
