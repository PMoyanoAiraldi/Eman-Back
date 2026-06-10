import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
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

    @IsString()
    address: string;

    @IsString()
    city: string;

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