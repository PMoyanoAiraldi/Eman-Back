import { ApiProperty } from "@nestjs/swagger";

export class ResponseSubCategoryDto {
    @ApiProperty({
        type: String,
        description: "El nombre de la subcategoría",
        required: true,
    })
    name: string;

}