import { Module } from "@nestjs/common";
import { Colors } from "./colors.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ColorsService } from "./colors.service";
import { ColorsController } from "./colors.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Colors])],
    providers: [ ColorsService],
    controllers: [ColorsController],
    exports: [ColorsService]
})
export class ColorsModule{}