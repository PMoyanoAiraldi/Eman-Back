import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateStateColorDto {
    
    @ApiProperty({ description: "Estado del color", required: false })
    @IsOptional()
    @IsBoolean()
    state: boolean;

}