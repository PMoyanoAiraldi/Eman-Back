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
    brandId?: string | null;

    @IsUUID()
    categoryId: string;

    @IsUUID()
    subcategoryId: string;

    @IsInt({ message: 'El peso debe ser un número entero' })
    @Min(1, { message: 'El peso debe ser mayor a 0' })
    @Max(25000, { message: 'El peso no puede superar los 25000 gramos' })
    weightGrams: number;

    @IsInt({ message: 'La altura debe ser un número entero' })
    @Min(1, { message: 'La altura debe ser mayor a 0' })
    @Max(150, { message: 'La altura no puede superar los 150 centimetros' })
    @IsOptional() 
    heightCm?: number;

    @IsInt({ message: 'El ancho debe ser un número entero' })
    @Min(1, { message: 'El ancho debe ser mayor a 0' })
    @Max(150, { message: 'El ancho no puede superar los 150 centimetros' })
    @IsOptional() 
    widthCm?: number;

    @IsInt({ message: 'El largo debe ser un número entero' })
    @Min(1, { message: 'El largo debe ser mayor a 0' })
    @Max(150, { message: 'El largo no puede superar los 150 centimetros' })
    @IsOptional() 
    lengthCm?: number;

    @IsOptional()
    @IsUUID()
    productTypeId?: string | null;
}