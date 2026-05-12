import { IsNumber, IsUUID, Min } from "class-validator";

export class CreateProductSizeDto {
    @IsNumber()
    @Min(0)
    stock: number;

    @IsUUID()
    sizeId: string;

    @IsUUID()
    productId: string;
}