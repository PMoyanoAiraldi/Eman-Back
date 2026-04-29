import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { MediaContentService } from "./mediaContent.service";

@ApiTags('MediaContent')
@Controller("media_content")
export class MediaContentController {
    constructor(
        private readonly mediaContentService: MediaContentService,
    ) { }
}