import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Categories } from './categories.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Categories])],
    providers: [ CategoriesService],
    controllers: [CategoriesController],
    exports: [CategoriesService]
})
export class CategoriesModule{}