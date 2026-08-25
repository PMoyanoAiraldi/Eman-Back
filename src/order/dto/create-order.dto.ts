import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { shippingTypeEnum } from '../order.entity';

class OrderItemDto {
    @IsString()
    productId: string;

    @IsString()
    variantId: string;

    @IsString()
    productName: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    unitPrice: number;
}

export class CreateOrderDto {
    @IsString()
    guestName: string;

    @IsString()
    guestEmail: string;

    @IsString()
    guestPhone: string;

    // Requeridos para correo_argentino y coordinado, no para retiro_en_local
    @ValidateIf((o: CreateOrderDto) => o.shippingType !== shippingTypeEnum.RETIRO_EN_LOCAL)
    @IsString()
    streetName: string;

    @ValidateIf((o: CreateOrderDto) => o.shippingType !== shippingTypeEnum.RETIRO_EN_LOCAL)
    @IsString()
    streetNumber: string;

    @ValidateIf((o: CreateOrderDto) => o.shippingType !== shippingTypeEnum.RETIRO_EN_LOCAL)
    @IsString()
    city: string;

    // Opcionales siempre
    @IsOptional()
    @IsString()
    floor?: string;

    @IsOptional()
    @IsString()
    apartment?: string;

    // Solo correo_argentino los necesita
    @ValidateIf((o: CreateOrderDto) => o.shippingType === shippingTypeEnum.CORREO_ARGENTINO)
    @IsString()
    provinceCode: string;

    @ValidateIf((o: CreateOrderDto) => o.shippingType === shippingTypeEnum.CORREO_ARGENTINO)
    @IsString()
    zipCode: string;

    @IsEnum(shippingTypeEnum)
    shippingType: shippingTypeEnum;

    @IsNumber()
    @IsOptional()
    shippingCost?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}