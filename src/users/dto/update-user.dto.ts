// users/dto/update-user.dto.ts
import { IsString, IsOptional, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    streetName?: string;
    
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    streetNumber?: string;
    
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    floor?: string;
    
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    apartment?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    city?: string;

    
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    provinceCode?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    @Length(8, 20)
    phone?: string;
}