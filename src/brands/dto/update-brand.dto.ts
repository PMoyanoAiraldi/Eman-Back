import { ApiProperty } from "@nestjs/swagger";
import {  IsNotEmpty, IsString, MaxLength } from "class-validator";


export class UpdateBrandDto {
    
    @ApiProperty({ description: "El nombre de la marca", required: true})
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

}