import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { MediaType, MediaSection } from '../mediaContent.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMediaContentDto {
    @ApiProperty({ example: 'https://res.cloudinary.com/...' })
    @IsString()
    url: string;

    @ApiProperty({ enum: MediaType, example: MediaType.HERO })
    @IsEnum(MediaType)
    type: MediaType;

    @ApiPropertyOptional({ enum: MediaSection, example: MediaSection.HOME })
    @IsEnum(MediaSection)
    @IsOptional()
    section?: MediaSection;

    @ApiPropertyOptional({ example: 'Imagen hero principal' })
    @IsString()
    @IsOptional()
    altText?: string;

    @ApiPropertyOptional({ example: 0 })
    @IsNumber()
    @IsOptional()
    @Min(0)
    order?: number;
}