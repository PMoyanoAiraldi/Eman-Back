import { IsUUID } from "class-validator";
import { RegisterUserDto } from "./register-user.dto";


export class RegisterFromOrderDto extends RegisterUserDto {
    @IsUUID()
    orderId: string
}