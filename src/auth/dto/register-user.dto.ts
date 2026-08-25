import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString,  IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @ApiProperty({
                type: String,
                description: "La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial (!@#$%^&*)",
                required: true,
        })
    @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[=!@#$%^&*])[A-Za-z\d=!@#$%^&*]{8,15}$/,
    {
    message: "La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial (!@#$%^&*)"
    }
    )
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsString()
    @IsNotEmpty()
    streetName: string;

    @IsString()
    @IsNotEmpty()
    streetNumber: string;

    @IsOptional()
    @IsString()
    floor?: string;

    @IsOptional()
    @IsString()
    apartment?: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    provinceCode: string;

    @IsString()
    @IsNotEmpty()
    phone: string;
}