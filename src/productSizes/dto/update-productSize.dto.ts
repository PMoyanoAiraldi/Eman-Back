import { IsNumber, Min } from "class-validator";

export class UpdateProductSizeDto {
    @IsNumber()
    @Min(0)
    stock: number;

}