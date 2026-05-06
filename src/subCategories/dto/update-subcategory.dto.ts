import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateSubCategoryDto {
    
    @ApiProperty({ description: "El nombre de la subcategoria", required: true})
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

}