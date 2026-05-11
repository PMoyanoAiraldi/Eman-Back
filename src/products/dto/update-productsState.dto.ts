import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateProductStateDto {
    @IsBoolean()
    @IsNotEmpty()
    state: boolean;
}