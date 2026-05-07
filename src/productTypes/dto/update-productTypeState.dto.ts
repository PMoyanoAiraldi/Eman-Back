import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateProductTypeStateDto {

    @ApiProperty({ description: "Estado del tipo de producto", required: false })
    @IsOptional()
    @IsBoolean()
    state: boolean;

}