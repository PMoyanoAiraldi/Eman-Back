import { IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateWithdrawalDto {
    @IsString()
    @Matches(/^#?[0-9a-fA-F-]{8,36}$/, { message: 'El número de pedido no es válido' })
    orderNumber: string;

    @IsEmail({}, { message: 'Ingresá un email válido' })
    email: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    note?: string;
}