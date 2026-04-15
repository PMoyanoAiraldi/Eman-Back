import { ApiProperty } from "@nestjs/swagger";

export class ResponseBrandDto {
    @ApiProperty({
        type: String,
        description: "El nombre de la marca",
        required: true,
    })
    name: string;

}