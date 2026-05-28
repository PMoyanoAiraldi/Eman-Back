import { IsNumber, Min } from "class-validator";

export class UpdateStockProductVariantsDto {
    @IsNumber()
    @Min(0)
    stock: number;

}