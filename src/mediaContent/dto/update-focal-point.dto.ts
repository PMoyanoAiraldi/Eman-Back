import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFocalPointDto {
    @ApiProperty({ example: 'center 20%' })
    @IsString()
    @IsNotEmpty()
    focalPoint: string;
}