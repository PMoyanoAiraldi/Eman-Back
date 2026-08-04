import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateIf } from 'class-validator';

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

    // Opcional en el negocio: puede no tener marca
    @IsOptional()
    @ValidateIf((o: UpdateProductDto) => o.brandId !== null)
    @IsUUID()
    brandId?: string | null;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsUUID()
    subcategoryId?: string;

    // Opcional en el negocio: puede no tener tipo
    @IsOptional()
    @ValidateIf((o: UpdateProductDto) => o.productTypeId !== null)
    @IsUUID()
    productTypeId?: string | null;

}