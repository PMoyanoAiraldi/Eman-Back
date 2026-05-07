import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateProductTypeDto {
    
    @ApiProperty({ description: "El nombre del tipo de producto", required: true})
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

}