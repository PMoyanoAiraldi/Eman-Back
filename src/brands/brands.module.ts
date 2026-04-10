import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Brands } from './brands.entity';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Brands])],
    providers: [ BrandsService],
    controllers: [BrandsController],
    exports: [BrandsService]
})
export class BrandsModule{}