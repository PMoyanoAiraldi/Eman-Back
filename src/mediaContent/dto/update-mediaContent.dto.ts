import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';
import { MediaType, MediaSection } from '../mediaContent.entity';

export class UpdateMediaContentDto {
    @IsEnum(MediaType)
    @IsOptional()
    type?: MediaType;

    @IsEnum(MediaSection)
    @IsOptional()
    section?: MediaSection;

    @IsString()
    @IsOptional()
    altText?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    order?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}