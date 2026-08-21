import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Products } from '../products/products.entity';

export interface PackageDimensions {
    weight: number; // gramos
    height: number;
    width: number;
    length: number;
}

interface CartItemInput {
    productId: string;
    quantity: number;
}

// Bultos en bolsa, no caja — ver conversación previa
const BULK_TIERS = [
    { maxWeight: 600,      height: 8,  width: 22, length: 30 },
    { maxWeight: 1500,     height: 12, width: 28, length: 38 },
    { maxWeight: Infinity, height: 18, width: 35, length: 45 },
];

@Injectable()
export class ShippingService {
    constructor(
        @InjectRepository(Products)
        private readonly productsRepository: Repository<Products>,
    ) {}

    async calculatePackage(items: CartItemInput[]): Promise<PackageDimensions> {
        const productIds = items.map(i => i.productId);
        const products = await this.productsRepository.find({
            where: { id: In(productIds) },
        });
        const productMap = new Map(products.map(p => [p.id, p]));

        let totalWeight = 0;
        for (const item of items) {
            const unitWeight = productMap.get(item.productId)?.weightGrams ?? 200; 
            totalWeight += unitWeight * item.quantity;
        }

        const tier = BULK_TIERS.find(t => totalWeight <= t.maxWeight)!;
        return { weight: totalWeight, height: tier.height, width: tier.width, length: tier.length };
    }
}