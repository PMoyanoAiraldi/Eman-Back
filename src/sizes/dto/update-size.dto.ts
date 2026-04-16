import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateSizeDto {
    
    @ApiProperty({ description: "El nombre del talle", required: true})
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

}