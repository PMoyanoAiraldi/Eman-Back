import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductTypes } from "./productTypes.entity";
import { Repository } from "typeorm";
import { CreateProductTypeDto } from "./dto/create-productType.dto";
import { UpdateProductTypeDto } from "./dto/update-productType.dto";

@Injectable()
export class ProductTypesService {
    constructor(
    @InjectRepository(ProductTypes)
        private readonly productTypesRepository: Repository<ProductTypes>,
    ) { }

    async createProductType(createProductTypeDto: CreateProductTypeDto): Promise<ProductTypes>{
        const normalizedName = createProductTypeDto.name.trim().toLowerCase();
            
        const existing = await this.productTypesRepository
            .createQueryBuilder('product_types')
            .where('LOWER(product_types.name) = :name', { name: normalizedName })
            .getOne();
            
        if (existing) {
            throw new HttpException(`El tipo de producto "${createProductTypeDto.name}" ya existe.`, HttpStatus.BAD_REQUEST);
        }   
                
        const productTypes = this.productTypesRepository.create({
            name: createProductTypeDto.name.trim()
        });
        console.log("ProductTypes antes de ser guardado", productTypes)
        
        return await this.productTypesRepository.save(productTypes);
    }

    async getAllProductTypes(): Promise <ProductTypes[]>{
        return await this.productTypesRepository.find();
    }
                
    async getAllProductTypesActive(): Promise<ProductTypes[]> {
        return this.productTypesRepository.find({
            where: { state: true },
            order: { name: 'ASC' }
        });
    }
        
    async getProductTypes(id: string): Promise<ProductTypes>{
        const productTypes = await this.productTypesRepository.findOne({ where: { id } });
            if (!productTypes) {
                throw new NotFoundException(`Tipo de producto con ID ${id} no encontrado`);
            }
                return productTypes;
        }

    async getProductTypesActive(id: string): Promise<ProductTypes> {
        const productTypes = await this.productTypesRepository.findOne({ where: { id } });
            if (!productTypes || !productTypes.state) {
                throw new NotFoundException(`Tipo de producto con ID ${id} no encontrado`);
            }
                return productTypes;
        }
        
    async updateState(id: string, state: boolean): Promise<ProductTypes> {
        const productTypes = await this.getProductTypes(id);
        productTypes.state = state;
            return this.productTypesRepository.save(productTypes);
    }

    async updateProductTypes(id: string, updateProductTypeDto: UpdateProductTypeDto): Promise<ProductTypes> {
        const productTypes = await this.getProductTypes(id); //reutilizamos método de búsqueda 
                
            if (!updateProductTypeDto.name) {
                throw new BadRequestException('No se proporcionaron datos para actualizar el tipo de producto.');
            }
                        
        const normalizedName = updateProductTypeDto.name.trim().toLowerCase();
                        
            if (productTypes.name.toLowerCase() === normalizedName ) {
                throw new BadRequestException(`El nombre "${updateProductTypeDto.name}" es igual al actual`);
            }
                
        const existing = await this.productTypesRepository
                .createQueryBuilder('product_types')
                .where('LOWER(product_types.name) = :name', { name: normalizedName })
                .andWhere('product_types.id != :id', { id }) //que no sea el mismo que estoy editando
                .getOne();
        
            if (existing) {
                throw new BadRequestException(`El tipo de producto "${updateProductTypeDto.name}" ya existe.`);
            }
        
            productTypes.name = updateProductTypeDto.name.trim();
        
            return this.productTypesRepository.save(productTypes);
    }


    
}