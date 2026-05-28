import {  IsHexColor, IsString } from 'class-validator';

export class CreateColorDto {
    @IsString()
    name: string;

    @IsHexColor()  //  valida que sea un hex válido ej: #1a1a1a
    hex: string;
}