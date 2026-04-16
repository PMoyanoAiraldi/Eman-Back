import { InjectRepository } from "@nestjs/typeorm";
import { Sizes } from "./sizes.entity";
import { Repository } from "typeorm";
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateSizeDto } from "./dto/create-size.dto";
import { UpdateSizeDto } from "./dto/update-size.dto";

@Injectable()
export class SizesService {
    constructor(
    @InjectRepository(Sizes)
        private readonly sizesRepository: Repository<Sizes>,
    ) { }

    async createSize(createSizeDto: CreateSizeDto): Promise<Sizes>{
            const normalizedName = createSizeDto.name.trim().toLowerCase();
        
            const existingSize = await this.sizesRepository
                .createQueryBuilder('sizes')
                .where('LOWER(sizes.name) = :name', { name: normalizedName })
                .getOne();
        
            if (existingSize) {
                throw new HttpException(`El talle "${createSizeDto.name}" ya existe.`, HttpStatus.BAD_REQUEST);
            }   
            
            const size = this.sizesRepository.create({
                name: createSizeDto.name.trim()
            });
            console.log("Talle antes de ser guardado", size)
    
            return await this.sizesRepository.save(size);
        }

    async getAllSizes(): Promise <Sizes[]>{
            return await this.sizesRepository.find();
        }
        
    async getAllSizesActive(): Promise<Sizes[]> {
            return this.sizesRepository.find({
                where: { state: true },
                order: { name: 'ASC' }
            });
        }

    async getSize(id: string): Promise<Sizes>{
            const size = await this.sizesRepository.findOne({ where: { id } });
                if (!size) {
                    throw new NotFoundException(`Talle con ID ${id} no encontrado`);
            }
                return size;
            }
    
    async getSizeActive(id: string): Promise<Sizes> {
            const size = await this.sizesRepository.findOne({ where: { id } });
                if (!size || !size.state) {
                    throw new NotFoundException(`Talle con ID ${id} no encontrado`);
                }
                    return size;
            }
    
    async updateState(id: string, state: boolean): Promise<Sizes> {
            const size = await this.getSize(id);
            size.state = state;
            return this.sizesRepository.save(size);
        }

    async updateSize(id: string, updateSizeDto: UpdateSizeDto): Promise<Sizes> {
            const size = await this.getSize(id); //reutilizamos método de búsqueda 
            
                if (!updateSizeDto.name) {
                    throw new BadRequestException('No se proporcionaron datos para actualizar el talle.');
                }
                    
                const normalizedName = updateSizeDto.name.trim().toLowerCase();
                    
                if (size.name.toLowerCase() === normalizedName ) {
                    throw new BadRequestException(`El nombre "${updateSizeDto.name}" es igual al actual`);
                }
            
                const existingSize = await this.sizesRepository
                    .createQueryBuilder('size')
                    .where('LOWER(size.name) = :name', { name: normalizedName })
                    .andWhere('size.id != :id', { id }) //que no sea el mismo talle que estoy editando
                    .getOne();
    
                if (existingSize) {
                    throw new BadRequestException(`El talle "${updateSizeDto.name}" ya existe.`);
                }
    
                size.name = updateSizeDto.name.trim();
    
                return this.sizesRepository.save(size);
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