import { ApiProperty } from '@nestjs/swagger';
import { rolEnum } from '../users.entity';

export class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    state: boolean;

    @ApiProperty({ enum: rolEnum })
    rol: rolEnum;
}