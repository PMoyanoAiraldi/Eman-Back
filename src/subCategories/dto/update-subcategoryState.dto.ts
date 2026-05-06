import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";


export class UpdateSubCategoryStateDto {

    @ApiProperty({ description: "Estado de la subcategoría", required: false })
    @IsOptional()
    @IsBoolean()
    state: boolean;

}