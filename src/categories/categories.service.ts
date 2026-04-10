import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './categories.entity';

@Injectable()
export class CategoriesService {
    constructor(
    @InjectRepository(Categories)
        private readonly categoriesRepository: Repository<Categories>,
    ) { }
}
