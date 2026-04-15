import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";


export class UpdateBrandDto {
    
    @ApiProperty({ description: "El nombre de la marca", required: true})
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({ description: "Estado de la marca", required: false })
    @IsOptional()
    @IsBoolean()
    state: boolean;

}