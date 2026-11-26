import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Products } from "./products.entity";
import { Brands } from "src/brands/brands.entity";
import { Categories, PackagingType } from "src/categories/categories.entity";
import { SubCategories } from "src/subCategories/subCategories.entity";
import { ProductTypes } from "src/productTypes/productTypes.entity";
import { CreateProductDto } from "./dto/create-products.dto";
import { UpdateProductDto } from "./dto/update-products.dto";

const FEATURED_LIMIT = 4;

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Products)
        private readonly productRepository: Repository<Products>,
        @InjectRepository(Brands)
        private readonly brandsRepository: Repository<Brands>,
        @InjectRepository(Categories)
        private readonly categoriesRepository: Repository<Categories>,
        @InjectRepository(SubCategories)
        private readonly subCategoriesRepository: Repository<SubCategories>,
        @InjectRepository(ProductTypes)
        private readonly productTypesRepository: Repository<ProductTypes>,
        
    ) {}

    async createProduct(createProductDto: CreateProductDto): Promise<Products> {
        if (createProductDto.isFeatured) {
            await this.assertFeaturedLimit();
        }

        // Verificar que no exista un producto con el mismo nombre
        const existing = await this.productRepository
            .createQueryBuilder('product')
            .where('LOWER(product.name) = :name', { name: createProductDto.name.trim().toLowerCase() })
            .getOne();

        if (existing) {
            throw new BadRequestException(`El producto "${createProductDto.name}" ya existe.`);
        }

        // Verificar que existan las relaciones

        let brand: Brands | null = null;
        if(createProductDto.brandId){
            brand = await this.brandsRepository.findOne({ where: { id: createProductDto.brandId } });
        if (!brand) throw new NotFoundException('Marca no encontrada');
        }

        const category = await this.categoriesRepository.findOne({ where: { id: createProductDto.categoryId } });
        if (!category) throw new NotFoundException('Categoría no encontrada');

        const subcategory = await this.subCategoriesRepository.findOne({ where: { id: createProductDto.subcategoryId } });
        if (!subcategory) throw new NotFoundException('Subcategoría no encontrada');

        let productType: ProductTypes | null = null;
        if (createProductDto.productTypeId) {
            productType = await this.productTypesRepository.findOne({ where: { id: createProductDto.productTypeId } });
            if (!productType) throw new NotFoundException('Tipo de producto no encontrado');
        }

        const product = this.productRepository.create({
            name: createProductDto.name.trim(),
            description: createProductDto.description.trim(),
            price: createProductDto.price,
            gender: createProductDto.gender,
            isFeatured: createProductDto.isFeatured,
            weightGrams: createProductDto.weightGrams,
            heightCm: createProductDto.heightCm,
            widthCm: createProductDto.widthCm,
            lengthCm: createProductDto.lengthCm,
            brand,
            category,
            subcategory,
            productType,
        });
        
        return await this.productRepository.save(product);
    }

        private async assertFeaturedLimit(excludeId?: string): Promise<void> {
        const count = await this.productRepository.count({
            where: {
                isFeatured: true,
                state: true,
                isDraft: false,
                ...(excludeId && { id: Not(excludeId) }),// excludeId no cuenta el product que se esta editando
            },
        });

        if (count >= FEATURED_LIMIT) {
            throw new BadRequestException(
                `Ya hay ${FEATURED_LIMIT} productos destacados. Quitá uno para agregar este.`
            );
        }
    }

    async getAllProducts(): Promise<Products[]> {
        return this.productRepository.find({
            relations: [
                'brand', 
                'category', 
                'subcategory', 
                'productType', 
                'variants', 
                'variants.size',  
                'variants.color', 
                'images'],
            order: { createdAt: 'DESC' }
        });
    }

    async getAllProductsActive(filters?: {
        categoryId?: string;
        subcategoryId?: string;
        brandId?: string;
        productTypeId?: string;
        gender?: string;
    }): Promise<Products[]>{
        const query = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.brand', 'brand')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.subcategory', 'subcategory')
            .leftJoinAndSelect('product.productType', 'productType')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.variants', 'variants')
            .leftJoinAndSelect('variants.size', 'size')
            .leftJoinAndSelect('variants.color', 'color')
            .where('product.state = :state', { state: true })
            .andWhere('product.isDraft = :isDraft', { isDraft: false })
            .orderBy('product.createdAt', 'DESC');

            if (filters?.categoryId) {
            query.andWhere('category.id = :categoryId', { categoryId: filters.categoryId });
        }
        if (filters?.subcategoryId) {
            query.andWhere('subcategory.id = :subcategoryId', { subcategoryId: filters.subcategoryId });
        }
        if (filters?.brandId) {
            query.andWhere('brand.id = :brandId', { brandId: filters.brandId });
        }
        if (filters?.productTypeId) {
            query.andWhere('productType.id = :productTypeId', { productTypeId: filters.productTypeId });
        }
        if (filters?.gender) {
            query.andWhere('product.gender = :gender', { gender: filters.gender });
        }

        return query.getMany();
    }

    async getProduct(id: string): Promise<Products> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: [
                'brand',
                'category',
                'subcategory',
                'productType',
                'images',
                'variants',
                'variants.size',
                'variants.color'
            ]
        });
        if (!product) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        return product;
    }

    async getProductActive(id: string): Promise<Products> {
        const product = await this.getProduct(id);
        if (!product.state || product.isDraft) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        return product;
    }

    async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Products> {
        const product = await this.getProduct(id);

        if (updateProductDto.name) {
            const normalizedName = updateProductDto.name.trim().toLowerCase();
            
            const existing = await this.productRepository
                .createQueryBuilder('product')
                .where('LOWER(product.name) = :name', { name: normalizedName })
                .andWhere('product.id != :id', { id })
                .getOne();

        if (existing) throw new BadRequestException(`El producto "${updateProductDto.name}" ya existe.`);
            product.name = updateProductDto.name.trim();
        }

        if (updateProductDto.description) product.description = updateProductDto.description.trim();
        if (updateProductDto.price) product.price = updateProductDto.price;
        if (updateProductDto.gender) product.gender = updateProductDto.gender;
        if (updateProductDto.isFeatured !== undefined) {
            // Solo validar cuando pasa de no destacado a destacado
            if (updateProductDto.isFeatured && !product.isFeatured) {
                await this.assertFeaturedLimit(product.id);
            }
            product.isFeatured = updateProductDto.isFeatured;
        }

        if (updateProductDto.weightGrams != null) {
            product.weightGrams = updateProductDto.weightGrams;
        }

        if (updateProductDto.heightCm !== undefined) product.heightCm = updateProductDto.heightCm;
        if (updateProductDto.widthCm  !== undefined) product.widthCm  = updateProductDto.widthCm;
        if (updateProductDto.lengthCm !== undefined) product.lengthCm = updateProductDto.lengthCm;

        if (updateProductDto.brandId !== undefined) {
            if (updateProductDto.brandId === null) {
                product.brand = null; // "Sin marca"
            } else {
                const brand = await this.brandsRepository.findOne({ where: { id: updateProductDto.brandId } });
                if (!brand) throw new NotFoundException('Marca no encontrada');
                product.brand = brand;
            }
        }

        if (updateProductDto.categoryId) {
            const category = await this.categoriesRepository.findOne({ where: { id: updateProductDto.categoryId } });
            if (!category) throw new NotFoundException('Categoría no encontrada');
            product.category = category;
        }

        if (updateProductDto.subcategoryId) {
            const subcategory = await this.subCategoriesRepository.findOne({ where: { id: updateProductDto.subcategoryId } });
            if (!subcategory) throw new NotFoundException('Subcategoría no encontrada');
            product.subcategory = subcategory;
        }

        if (updateProductDto.productTypeId !== undefined) {
            if (updateProductDto.productTypeId === null) {
                product.productType = null; // "Sin tipo"
            } else {
                const productType = await this.productTypesRepository.findOne({ where: { id: updateProductDto.productTypeId } });
                if (!productType) throw new NotFoundException('Tipo de producto no encontrado');
                product.productType = productType;
            }
        }

        
        if (
            !product.isDraft &&
            product.category?.packaging === PackagingType.CAJA &&
            !(product.heightCm && product.widthCm && product.lengthCm)
        ) {
            throw new BadRequestException('Los productos de calzado necesitan las medidas de la caja.');
        }

        return this.productRepository.save(product);
    }

    async updateState(id: string, state: boolean): Promise<Products> {
        const product = await this.getProduct(id);

        if (!state) {
        // Un producto inactivo no puede quedar como destacado
        product.isFeatured = false;
        } else if (product.isFeatured) {
            // Por si hay datos viejos: reactivar un destacado no puede pasar el límite
            await this.assertFeaturedLimit(product.id);
        }

        product.state = state;
        return this.productRepository.save(product);
    }

    async getFeaturedProducts(): Promise<Products[]> {
        return this.productRepository.find({
            where: { isFeatured: true, state: true, isDraft: false  },
            relations: ['images', 'category', 'brand', 'variants', 'variants.size', 'variants.color'],
            order: { createdAt: 'DESC' },
            take: 4
            });
    }

    async publish(id: string): Promise<Products> {
        const product = await this.productRepository.findOne({ 
            where: { id },
            relations: ['images', 'variants', 'category']
        });
        if (!product) throw new NotFoundException('Producto no encontrado');

        const missing: string[] = [];
        if (!product.images || product.images.length === 0) missing.push('imagen');
        if (!product.variants || product.variants.length === 0) missing.push('variantes (talle/color)');
        else if (!product.variants.some(v => v.stock > 0)) missing.push('stock');
        if (!product.price || Number(product.price) <= 0) missing.push('precio');

        if (!product.weightGrams || product.weightGrams <= 0) missing.push('peso');
        
        if (
            product.category?.packaging === PackagingType.CAJA &&
            !(product.heightCm && product.widthCm && product.lengthCm)
        ) {
            missing.push('medidas de la caja');
        }


        if (missing.length > 0) {
            throw new BadRequestException(
                `No se puede publicar: falta ${missing.join(', ')}.`
            );
        }
        if (product.isFeatured) {
            await this.assertFeaturedLimit(product.id);
        }

        product.isDraft = false;
        return await this.productRepository.save(product);
    }

    async deleteDraft(id: string): Promise<{ message: string }> {
        const product = await this.productRepository.findOne({ where: { id } });
            if (!product) throw new NotFoundException('Producto no encontrado');
            if (!product.isDraft) {
                throw new BadRequestException('Solo se pueden eliminar productos en borrador.');
            }
            await this.productRepository.remove(product);
            return { message: 'Borrador eliminado correctamente' };
        };

}