import { ApiProperty } from "@nestjs/swagger";

export class ResponseCategoryDto {
    @ApiProperty({
        type: String,
        description: "El nombre de la categoría",
        required: true,
    })
    name: string;

}