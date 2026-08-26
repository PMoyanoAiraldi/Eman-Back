import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { DeliveryType, shippingTypeEnum } from '../order.entity';

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

    // Solo aplica/es obligatorio cuando shippingType es CORREO_ARGENTINO
    @ValidateIf((o: CreateOrderDto) => o.shippingType === shippingTypeEnum.CORREO_ARGENTINO)
    @IsEnum(DeliveryType)
    deliveryType?: DeliveryType;

    // Dirección: obligatoria si NO es retiro en local Y (no es correo_argentino, O es correo_argentino a domicilio)
    @ValidateIf((o: CreateOrderDto) =>
        o.shippingType !== shippingTypeEnum.RETIRO_EN_LOCAL &&
        (o.shippingType !== shippingTypeEnum.CORREO_ARGENTINO || o.deliveryType === DeliveryType.DOMICILIO)
    )
    @IsString()
    streetName: string;

    @ValidateIf((o: CreateOrderDto) =>
        o.shippingType !== shippingTypeEnum.RETIRO_EN_LOCAL &&
        (o.shippingType !== shippingTypeEnum.CORREO_ARGENTINO || o.deliveryType === DeliveryType.DOMICILIO)
    )
    @IsString()
    streetNumber: string;

    @ValidateIf((o: CreateOrderDto) =>
        o.shippingType !== shippingTypeEnum.RETIRO_EN_LOCAL &&
        (o.shippingType !== shippingTypeEnum.CORREO_ARGENTINO || o.deliveryType === DeliveryType.DOMICILIO)
    )
    @IsString()
    city: string;

    // Opcionales siempre
    @IsOptional()
    @IsString()
    floor?: string;

    @IsOptional()
    @IsString()
    apartment?: string;

    // provinceCode y zipCode: siempre necesarios en correo_argentino (domicilio o sucursal),
    // porque se usan para cotizar y para elegir sucursales de esa provincia
    @ValidateIf((o: CreateOrderDto) => o.shippingType === shippingTypeEnum.CORREO_ARGENTINO)
    @IsString()
    provinceCode: string;

    @ValidateIf((o: CreateOrderDto) => o.shippingType === shippingTypeEnum.CORREO_ARGENTINO)
    @IsString()
    zipCode: string;

    // Sucursal: obligatoria solo si correo_argentino + sucursal
    @ValidateIf((o: CreateOrderDto) =>
        o.shippingType === shippingTypeEnum.CORREO_ARGENTINO && o.deliveryType === DeliveryType.SUCURSAL
    )
    @IsString()
    agencyCode?: string;

    @ValidateIf((o: CreateOrderDto) =>
        o.shippingType === shippingTypeEnum.CORREO_ARGENTINO && o.deliveryType === DeliveryType.SUCURSAL
    )
    @IsOptional()
    @IsString()
    agencyName?: string;

    @ValidateIf((o: CreateOrderDto) =>
        o.shippingType === shippingTypeEnum.CORREO_ARGENTINO && o.deliveryType === DeliveryType.SUCURSAL
    )
    @IsOptional()
    @IsString()
    agencyAddress?: string;

    @ValidateIf((o: CreateOrderDto) =>
    o.shippingType === shippingTypeEnum.CORREO_ARGENTINO && o.deliveryType === DeliveryType.SUCURSAL
    )
    @IsString()
    agencyCity?: string;

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