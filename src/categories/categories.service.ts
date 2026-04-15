import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './categories.entity';
import { CreateCategoriesDto } from './dto/create-categories.dto';

@Injectable()
export class CategoriesService {
    constructor(
    @InjectRepository(Categories)
        private readonly categoriesRepository: Repository<Categories>,
    ) { }

    async createCategories(createCategoriesDto: CreateCategoriesDto): Promise<Categories>{
            const normalizedName = createCategoriesDto.name.trim().toLowerCase();
        
            const existingCategories = await this.categoriesRepository
                .createQueryBuilder('categories')
                .where('LOWER(brand.name) = :name', { name: normalizedName })
                .getOne();
        
            if (existingCategories) {
                throw new HttpException(`La categoria "${createCategoriesDto.name}" ya existe.`, HttpStatus.BAD_REQUEST);
            }   
            
            const categories = this.categoriesRepository.create({
                name: createCategoriesDto.name.trim()
            });
            console.log("Categoria antes de ser guardada", categories)
    
            return await this.categoriesRepository.save(categories);
        }

}
