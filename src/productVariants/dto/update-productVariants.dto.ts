import { IsNumber, Min } from "class-validator";

export class UpdateProductVariantsDto {
    @IsNumber()
    @Min(0)
    stock: number;

}