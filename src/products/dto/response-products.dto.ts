import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class ResponseProductDto {
    @IsUUID()
    id: string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsNumber()
    price: number;

    @IsBoolean()
    state: boolean;

    @IsDate()
    createdAt: Date;

    @IsOptional()
    @IsEnum(['hombre', 'mujer', 'unisex'])
    gender: string;

    brand?: {
        id: string;
        name: string;
    } | null;

    category: {
        id: string;
        name: string;
    };

    subcategory: {
        id: string;
        name: string;
    };

    productType?: {
        id: string;
        name: string;
    } | null;

    images: {
        id: string;
        url: string;
        isPrimary: boolean;
        order: number;
    }[];

    variants: {
        id: string;
        stock: number;
        size: {
            id: string;
            name: string;
        };
        color: {
        id: string;
        name: string;
        hex: string;  
    };
    }[];
}