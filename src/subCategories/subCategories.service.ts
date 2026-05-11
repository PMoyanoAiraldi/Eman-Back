import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SubCategories } from "./subCategories.entity";
import { Repository } from "typeorm";
import { CreateSubCategoryDto } from "./dto/create-subcategory.dto";
import { UpdateSubCategoryDto } from "./dto/update-subcategory.dto";
import { Categories } from "src/categories/categories.entity";

@Injectable()
export class SubCategoriesService {
    constructor(
    @InjectRepository(SubCategories)
        private readonly subCategoriesRepository: Repository<SubCategories>,
    @InjectRepository(Categories)
        private readonly categoriesRepository: Repository<Categories>
    ) { }

    async createSubCategories(createSubCategoryDto: CreateSubCategoryDto): Promise<SubCategories>{
                const normalizedName = createSubCategoryDto.name.trim().toLowerCase();
            
                // Verificar que la categoría padre existe
                const category = await this.categoriesRepository.findOne({ 
                    where: { id: createSubCategoryDto.categoryId } 
                });
                if (!category) {
                    throw new NotFoundException(`Categoría con ID ${createSubCategoryDto.categoryId} no encontrada`);
                }
                
                // Chequeo duplicado por nombre Y categoría padre
                const existing = await this.subCategoriesRepository
                    .createQueryBuilder('subcategory')
                    .where('LOWER(subcategory.name) = :name', { name: normalizedName })
                    .andWhere('subcategory.categoryId = :categoryId', { categoryId: createSubCategoryDto.categoryId })
                    .getOne();
            
                if (existing) {
                    throw new HttpException(`La subcategoria "${createSubCategoryDto.name}" ya existe en esa categoría.`, HttpStatus.BAD_REQUEST);
                }   
                
                const subcategory = this.subCategoriesRepository.create({
                    name: createSubCategoryDto.name.trim(),
                    category
                });
                console.log("Subcategoria antes de ser guardada", subcategory)
        
                return await this.subCategoriesRepository.save(subcategory);
            }
    
        async getAllSubCategories(): Promise <SubCategories[]>{
                return await this.subCategoriesRepository.find({ relations: ['category'] });
            }
            
        async getAllSubCategoriesActive(): Promise<SubCategories[]> {
                return this.subCategoriesRepository.find({
                    where: { state: true },
                    relations: ['category'],
                    order: { name: 'ASC' }
                });
            }

        async getSubCategoriesByCategory(categoryId: string): Promise<SubCategories[]> {
            return this.subCategoriesRepository.find({
                where: { 
                    category: { id: categoryId },
                    state: true 
                },
                relations: ['category'],
                order: { name: 'ASC' }
            });
        }
    
        async getSubCategory(id: string): Promise<SubCategories>{
                const subcategory = await this.subCategoriesRepository.findOne({ 
                    where: { id },
                    relations: ['category']
                });
                    if (!subcategory) {
                        throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
                }
                    return subcategory;
                }
        
        async getSubCategoryActive(id: string): Promise<SubCategories> {
                const subcategory = await this.subCategoriesRepository.findOne({ 
                    where: { id },
                    relations: ['category']
                });
                    if (!subcategory || !subcategory.state) {
                        throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
                    }
                        return subcategory;
                }
        
        async updateState(id: string, state: boolean): Promise<SubCategories> {
                const subcategory = await this.getSubCategory(id);
                subcategory.state = state;
                return this.subCategoriesRepository.save(subcategory);
            }
    
        async updateSubCategory(id: string, updateSubCategoryDto: UpdateSubCategoryDto): Promise<SubCategories> {
                const subcategory = await this.getSubCategory(id); //reutilizamos método de búsqueda 
                
                    if (!updateSubCategoryDto.name) {
                        throw new BadRequestException('No se proporcionaron datos para actualizar la subcategoría.');
                    }
                        
                    const normalizedName = updateSubCategoryDto.name.trim().toLowerCase();
                        
                    if (subcategory.name.toLowerCase() === normalizedName ) {
                        throw new BadRequestException(`El nombre "${updateSubCategoryDto.name}" es igual al actual`);
                    }
                
                    // Chequeo duplicado considerando la categoría padre
                    const existingSubCategory = await this.subCategoriesRepository
                        .createQueryBuilder('subcategory')
                        .where('LOWER(subcategory.name) = :name', { name: normalizedName })
                        .andWhere('subcategory.categoryId = :categoryId', { categoryId: subcategory.category.id })
                        .andWhere('subcategory.id != :id', { id }) //que no sea la misma subcategoría que estoy editando
                        .getOne();
        
                    if (existingSubCategory) {
                        throw new BadRequestException(`La categoría "${updateSubCategoryDto.name}" ya existe.`);
                    }
        
                    subcategory.name = updateSubCategoryDto.name.trim();
        
                    return this.subCategoriesRepository.save(subcategory);
                }
    
                async removeImage(id: string): Promise<SubCategories> {
                    const subcategory = await this.getSubCategory(id);
                    
                    if (!subcategory.imageUrl) {
                        throw new BadRequestException('La subcategoría no tiene imagen');
                    }
                    
                    subcategory.imageUrl = null;
                    return this.subCategoriesRepository.save(subcategory);
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