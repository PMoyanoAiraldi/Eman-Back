import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "src/users/users.entity";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtService } from "@nestjs/jwt";



@Module({
    imports: [TypeOrmModule.forFeature([Users])],
    providers: [ AuthService, JwtService],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule{}