import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brands } from './brands.entity';
import {  Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
    constructor(
    @InjectRepository(Brands)
        private readonly brandsRepository: Repository<Brands>,
    ) { }

    async createBrands(createBrandDto: CreateBrandDto): Promise<Brands>{
            const normalizedName = createBrandDto.name.trim().toLowerCase();
    
            const existingBrand = await this.brandsRepository
            .createQueryBuilder('brand')
            .where('LOWER(brand.name) = :name', { name: normalizedName })
            .getOne();
    
            if (existingBrand) {
                throw new HttpException(`La marca "${createBrandDto.name}" ya existe.`, HttpStatus.BAD_REQUEST);
            }   
        
            const brand = this.brandsRepository.create({
                name: createBrandDto.name.trim()
            });
            console.log("Marca antes de ser guardada", brand)

            return await this.brandsRepository.save(brand);
    }

    async getAllBrands(): Promise <Brands[]>{
        return await this.brandsRepository.find();
    }

    async getAllActive(): Promise<Brands[]> {
        return this.brandsRepository.find({
            where: { state: true },
            order: { name: 'ASC' }
        });
    }

    async getBrand(id: string): Promise<Brands>{
        const brand = await this.brandsRepository.findOne({ where: { id } });
            if (!brand) {
                throw new NotFoundException(`Marca con ID ${id} no encontrada`);
        }
            return brand;
        }

    async getBrandActive(id: string): Promise<Brands> {
        const brand = await this.brandsRepository.findOne({ where: { id } });
            if (!brand || !brand.state) {
                throw new NotFoundException(`Marca con ID ${id} no encontrada`);
            }
                return brand;
        }

    async updateState(id: string, state: boolean): Promise<Brands> {
        const brand = await this.getBrand(id);
        brand.state = state;
        return this.brandsRepository.save(brand);
    }
    
    async updateBrand(id: string, updateBrandDto: UpdateBrandDto): Promise<Brands> {
        const brand = await this.getBrand(id); //reutilizamos método de búsqueda 
        
            if (!updateBrandDto.name) {
                throw new BadRequestException('No se proporcionaron datos para actualizar la marca.');
            }
                
            const normalizedName = updateBrandDto.name.trim().toLowerCase();
                
            if (brand.name.toLowerCase() === normalizedName ) {
                throw new BadRequestException(`El nombre "${updateBrandDto.name}" es igual al actual`);
            }
        
            const existingBrand = await this.brandsRepository
                .createQueryBuilder('brand')
                .where('LOWER(brand.name) = :name', { name: normalizedName })
                .andWhere('brand.id != :id', { id }) //que no sea la misma marca que estoy editando
                .getOne();

            if (existingBrand) {
                throw new BadRequestException(`La marca "${updateBrandDto.name}" ya existe.`);
            }

            brand.name = updateBrandDto.name.trim();

            return this.brandsRepository.save(brand);
        }

    // async findProductByBrand(brandId: string): Promise <ResponseMarcaDto> {
    //     const marca = await this.marcaRepository.findOne({
    //                 where: { id: marcaId },
    //                 relations: ['productos'],
    //         });
        
    //     if (!marca || !marca.state) {
    //         throw new HttpException("Marca no encontrada", HttpStatus.NOT_FOUND);
    //     }
        
    //     // Filtra los productos activos
    //     const productActives = marca.productos
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
