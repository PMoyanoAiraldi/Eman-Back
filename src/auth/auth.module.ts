import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "src/users/users.entity";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UsersService } from "src/users/users.service";



@Module({
    imports: [
        TypeOrmModule.forFeature([Users]),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET, // o process.env.JWT_SECRET
            signOptions: { expiresIn: "1h" },
        }),
        ConfigModule,
        ],
    providers: [ AuthService, UsersService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule{}