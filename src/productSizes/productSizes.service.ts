import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ProductSizes } from "./productSizes.entity";
import { Products } from "src/products/products.entity";
import { Sizes } from "src/sizes/sizes.entity";
import { CreateProductSizeDto } from "./dto/create-productSize.dto";
import { UpdateProductSizeDto } from "./dto/update-productSize.dto";

@Injectable()
export class ProductSizesService {
    constructor(
        @InjectRepository(ProductSizes)
            private readonly productSizesRepository: Repository<ProductSizes>,
        @InjectRepository(Products)
            private readonly productsRepository: Repository<Products>,
        @InjectRepository(Sizes)
            private readonly sizesRepository: Repository<Sizes>,
    ) { }

    async addSize(createProductSizeDto: CreateProductSizeDto): Promise <ProductSizes>{
        const { productId, sizeId, stock } = createProductSizeDto;

        const product = await this.productsRepository.findOne({ where:{ id: productId }})
        if(!product){
            throw new NotFoundException('Producto no encontrado')
        }

        const size = await this.sizesRepository.findOne({ where: { id: sizeId}})
        if(!size){
            throw new NotFoundException('Talle no encontrado')
        }

        // Verificamos que no exista ese talle para ese producto
        const existing = await this.productSizesRepository.findOne({
            where:{
                product: {id: productId},
                size: {id: sizeId}
            }
        });

        if (existing) throw new BadRequestException('Ese talle ya existe para este producto');

        const productSize = this.productSizesRepository.create({ product, size, stock });
            return await this.productSizesRepository.save(productSize);
    }

    async updateStock(id: string, updateProductSizeDto: UpdateProductSizeDto): Promise<ProductSizes>{
        const productSize = await this.productSizesRepository.findOne({where: {id}});
            if (!productSize) throw new NotFoundException('Talle de producto no encontrado');
        
            productSize.stock = updateProductSizeDto.stock;
            return this.productSizesRepository.save(productSize);
            
    }

    async removeSize(id: string): Promise<void>{
        const productSize = await this.productSizesRepository.findOne({where: { id}});
                    
            if (!productSize) {
                throw new BadRequestException('El talle de producto no encontrado');
            }
                    
            await this.productSizesRepository.remove(productSize);
                
        }

    async getSizesByProduct(productId: string): Promise<ProductSizes[]>{
        const productSize = await this.productSizesRepository.find({
                where: { product: { id: productId } },
                relations: ['size'],
                order: { size: { name: 'ASC' } }
            })
                return productSize;
            }
    
    async getProductsBySize(sizeId: string): Promise<ProductSizes[]> {
    return this.productSizesRepository.find({
        where: { 
            size: { id: sizeId },
            stock: MoreThan(0) // solo los que tienen stock
        },
        relations: ['product', 'product.images', 'size'],
    });
    }
}