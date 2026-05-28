import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, MoreThan, Repository } from "typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ProductVariants } from "./productVariants.entity";
import { Products } from "src/products/products.entity";
import { Sizes } from "src/sizes/sizes.entity";
import { CreateProductVariantsDto } from "./dto/create-productVariants.dto";
import { Colors } from "src/colors/colors.entity";
import { UpdateStockProductVariantsDto } from "./dto/updateStock-productVariants.dto";


@Injectable()
export class ProductVariantsService {
    constructor(
        @InjectRepository(ProductVariants)
            private readonly productVariantsRepository: Repository<ProductVariants>,
        @InjectRepository(Products)
            private readonly productsRepository: Repository<Products>,
        @InjectRepository(Sizes)
            private readonly sizesRepository: Repository<Sizes>,
        @InjectRepository(Colors)
            private readonly colorsRepository: Repository<Colors>    
    ) { }

    async addVariants(createProductVariantsDto: CreateProductVariantsDto): Promise <ProductVariants>{
        const { productId, sizeId, colorId, stock } = createProductVariantsDto;

        const product = await this.productsRepository.findOne({ where:{ id: productId }})
        if(!product){
            throw new NotFoundException('Producto no encontrado')
        }

        const size = await this.sizesRepository.findOne({ where: { id: sizeId}})
        if(!size){
            throw new NotFoundException('Talle no encontrado')
        }

        const color = await this.colorsRepository.findOne({ where: { id: colorId}})
        if(!color){
            throw new NotFoundException('Color no encontrado')
        }

        // Verificamos que no exista esa variante para ese producto
        const existing = await this.productVariantsRepository.findOne({
            where:{
                product: {id: productId},
                size: {id: sizeId},
                color: {id: colorId}
            }
        });

        if (existing) throw new BadRequestException('Esa variante ya existe para este producto');

        const productVariants = this.productVariantsRepository.create({ product, size, color, stock });
            return await this.productVariantsRepository.save(productVariants);
    }

    async updateStock(id: string, updateStockProductVariantsDto: UpdateStockProductVariantsDto): Promise<ProductVariants>{
        const productVariants = await this.productVariantsRepository.findOne({where: {id}});
            if (!productVariants) throw new NotFoundException('Variante de producto no encontrado');
        
            productVariants.stock = updateStockProductVariantsDto.stock;
            return this.productVariantsRepository.save(productVariants);
            
    }

    async removeVariants(id: string): Promise<void>{
        const productVariants = await this.productVariantsRepository.findOne({where: { id}});
                    
            if (!productVariants) {
                throw new NotFoundException('La variante de producto no fue encontrado');
            }
                    
            await this.productVariantsRepository.remove(productVariants);
                
        }

    async getVariantsByProduct(productId: string): Promise<ProductVariants[]>{
        const productVariants = await this.productVariantsRepository.find({
                where: { product: { id: productId } },
                relations: ['size', 'color'],
                order: { size: { name: 'ASC' } }
            })
                return productVariants;
            }
    
    async getVariantsByFilters(sizeId?: string, colorId?: string): Promise<ProductVariants[]> {
    const where: FindOptionsWhere<ProductVariants>  = { stock: MoreThan(0) }; //solo los que tiene stock
    //FindOptionsWhere, sirve porque typeorm sabe que propiedades traer o sea filtrar sin decirle

        if (sizeId) where.size = { id: sizeId };
        if (colorId) where.color = { id: colorId };

        return  await this.productVariantsRepository.find({
            where,
            relations: ['product', 'product.images', 'size', 'color'],
        });
    }
}