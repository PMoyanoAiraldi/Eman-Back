import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsEnum(['hombre', 'mujer', 'unisex'])
    gender?: string;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsInt({ message: 'El peso debe ser un número entero' })
    @Min(1, { message: 'El peso debe ser mayor a 0' })
    @Max(25000, { message: 'El peso no puede superar los 25000 gramos' })
    @IsOptional() // default 200 de la entity
    weightGrams?: number;

    @IsOptional()
    @IsUUID()
    brandId?: string | null;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsUUID()
    subcategoryId?: string;

    @IsOptional()
    @IsUUID()
    productTypeId?: string | null;

}