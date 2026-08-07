import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "./users.entity";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { EmailService } from "src/email/email.service";


@Module({
    imports: [TypeOrmModule.forFeature([Users])],
    providers: [ UsersService, EmailService],
    controllers: [UsersController],
    exports: [UsersService]
})
export class UsersModule{}