import { IsHexColor, IsOptional, IsString } from "class-validator";

export class ResponseColorDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsHexColor()
    hex?: string;
}