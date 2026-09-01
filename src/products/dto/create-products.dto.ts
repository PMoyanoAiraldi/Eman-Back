import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsEnum(['hombre', 'mujer', 'unisex'])
    gender?: string;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @IsUUID()
    brandId?: string;

    @IsUUID()
    categoryId: string;

    @IsUUID()
    subcategoryId: string;

    @IsInt({ message: 'El peso debe ser un número entero' })
    @Min(1, { message: 'El peso debe ser mayor a 0' })
    @Max(25000, { message: 'El peso no puede superar los 25000 gramos' })
    @IsOptional() // default 200 de la entity
    weightGrams?: number;

    @IsOptional()
    @IsUUID()
    productTypeId: string;
}