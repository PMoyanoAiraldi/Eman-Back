import { IsEnum, IsOptional, IsString, IsNumber,  Min } from 'class-validator';
import { MediaType, MediaSection } from '../mediaContent.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateMediaContentDto {
    
    @ApiProperty({ enum: MediaType, example: MediaType.HERO })
    @IsEnum(MediaType)
    type?: MediaType;
    
    @ApiPropertyOptional({ enum: MediaSection, example: MediaSection.HOME })
    @IsEnum(MediaSection)
    @IsOptional()
    section?: MediaSection;
    
    @ApiPropertyOptional({ example: 'Imagen hero principal' })
    @IsString()
    @IsOptional()
    altText?: string;

    
    @ApiPropertyOptional({ example: 'Nueva coleccion' })
    @IsString()
    @IsOptional()
    tag?: string;

    @ApiPropertyOptional({ example: 'Tu mejor versión' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ example: 'Moda que te define' })
    @IsString()
    @IsOptional()
    subtitle?: string;

    @ApiPropertyOptional({ example: 'Explorar' })
    @IsString()
    @IsOptional()
    ctaText?: string;

    @ApiPropertyOptional({ example: '/mujer' })
    @IsString()
    @IsOptional()
    ctaUrl?: string;
    
    @ApiPropertyOptional({ example: 0 })
    @Transform(({ value }: { value: string }) => parseInt(value))
    @IsNumber()
    @IsOptional()
    @Min(0)
    order?: number;
}