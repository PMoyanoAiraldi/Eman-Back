import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brands } from './brands.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BrandsService {
    constructor(
    @InjectRepository(Brands)
        private readonly brandsRepository: Repository<Brands>,
    ) { }
}
