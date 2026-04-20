import { ApiProperty } from "@nestjs/swagger";

export class ResponseZiseDto {
    @ApiProperty({
        type: String,
        description: "El nombre del talle",
        required: true,
    })
    name: string;

}