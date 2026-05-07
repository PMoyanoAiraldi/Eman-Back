import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateSubCategoryDto {
    
    @ApiProperty({ description: "El nombre de la subcategoria", required: true})
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsUUID()
    @IsNotEmpty()
    categoryId: string;

}