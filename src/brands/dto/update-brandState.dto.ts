import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";


export class UpdateBrandStateDto {

    @ApiProperty({ description: "Estado de la marca", required: false })
    @IsOptional()
    @IsBoolean()
    state: boolean;

}