import { IsNumber, IsUUID, Min } from "class-validator";

export class CreateProductVariantsDto {
    @IsNumber()
    @Min(0)
    stock: number;

    @IsUUID()
    sizeId: string;

    @IsUUID()
    productId: string;

    @IsUUID()
    colorId: string
}