import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCategoryDto {
    
    @ApiProperty({ description: "El nombre de la categoria", required: true})
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

}