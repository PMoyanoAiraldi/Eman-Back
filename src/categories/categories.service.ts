import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
    @InjectRepository(Categories)
        private readonly categoriesRepository: Repository<Categories>,
    ) { }

    async createCategories(createCategoryDto: CreateCategoryDto): Promise<Categories>{
            const normalizedName = createCategoryDto.name.trim().toLowerCase();
        
            const existingCategories = await this.categoriesRepository
                .createQueryBuilder('categories')
                .where('LOWER(categories.name) = :name', { name: normalizedName })
                .getOne();
        
            if (existingCategories) {
                throw new HttpException(`La categoria "${createCategoryDto.name}" ya existe.`, HttpStatus.BAD_REQUEST);
            }   
            
            const categories = this.categoriesRepository.create({
                name: createCategoryDto.name.trim()
            });
            console.log("Categoria antes de ser guardada", categories)
    
            return await this.categoriesRepository.save(categories);
        }

    async getAllCategories(): Promise <Categories[]>{
            return await this.categoriesRepository.find();
        }
        
    async getAllCategoriesActive(): Promise<Categories[]> {
            return this.categoriesRepository.find({
                where: { state: true },
                order: { name: 'ASC' }
            });
        }

    async getCategory(id: string): Promise<Categories>{
            const category = await this.categoriesRepository.findOne({ where: { id } });
                if (!category) {
                    throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
            }
                return category;
            }
    
    async getCategoryActive(id: string): Promise<Categories> {
            const category = await this.categoriesRepository.findOne({ where: { id } });
                if (!category || !category.state) {
                    throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
                }
                    return category;
            }
    
    async updateState(id: string, state: boolean): Promise<Categories> {
            const category = await this.getCategory(id);
            category.state = state;
            return this.categoriesRepository.save(category);
        }

    async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Categories> {
            const category = await this.getCategory(id); //reutilizamos método de búsqueda 
            
                if (!updateCategoryDto.name) {
                    throw new BadRequestException('No se proporcionaron datos para actualizar la categoría.');
                }
                    
                const normalizedName = updateCategoryDto.name.trim().toLowerCase();
                    
                if (category.name.toLowerCase() === normalizedName ) {
                    throw new BadRequestException(`El nombre "${updateCategoryDto.name}" es igual al actual`);
                }
            
                const existingCategory = await this.categoriesRepository
                    .createQueryBuilder('category')
                    .where('LOWER(category.name) = :name', { name: normalizedName })
                    .andWhere('category.id != :id', { id }) //que no sea la misma categoría que estoy editando
                    .getOne();
    
                if (existingCategory) {
                    throw new BadRequestException(`La categoría "${updateCategoryDto.name}" ya existe.`);
                }
    
                category.name = updateCategoryDto.name.trim();
    
                return this.categoriesRepository.save(category);
            }
    
        // async findProductByCategory(categoryId: string): Promise <ResponseCategoryDto> {
        //     const category = await this.categoriesRepository.findOne({
        //                 where: { id: categoryId },
        //                 relations: ['productos'],
        //         });
            
        //     if (!category || !category.state) {
        //         throw new HttpException("Categoria no encontrada", HttpStatus.NOT_FOUND);
        //     }
            
        //     // Filtra los productos activos
        //     const productActives = category.products
        //     .filter(product => product.state)
        //     .map(product => this.toProductResponseDto(product)) //función que convierte entidades en DTO
            
        //     // Devuelve la información de la marca activa con sus productos activos
        //         return {
        //         codigo: marca.codigo,
        //         nombre: marca.nombre, 
        //         productos: productActives
        //     };
            
        //     }

}
