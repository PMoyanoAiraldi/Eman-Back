import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateProductStateDto {

    @ApiProperty({ description: "Estado del producto", required: false })
    @IsBoolean()
    @IsNotEmpty()
    state: boolean;
}