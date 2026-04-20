import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateSizeStateDto {

    @ApiProperty({ description: "Estado del talle", required: false })
    @IsOptional()
    @IsBoolean()
    state: boolean;

}