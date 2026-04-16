import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";


export class UpdateCategoryStateDto {

    @ApiProperty({ description: "Estado de la categoría", required: false })
    @IsOptional()
    @IsBoolean()
    state: boolean;

}