import { IsNumber, IsString } from "class-validator";

export class PreferenceItemDto {

    @IsString()
    productId:   string;

    @IsString()
    productName: string;

    @IsNumber()
    quantity:    number;

    @IsNumber()
    unitPrice:   number;
}