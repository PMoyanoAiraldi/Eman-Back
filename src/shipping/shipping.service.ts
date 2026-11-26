import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Products } from '../products/products.entity';
import { PackagingType } from 'src/categories/categories.entity';

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

// Bolsas para ropa. maxWeight = suma del peso de las prendas.
// Valores ESTIMADOS: reemplazar por medidas de bolsas reales armadas.
const BULK_TIERS = [
    { maxWeight: 600,      height: 8,  width: 22, length: 30 },
    { maxWeight: 1500,     height: 12, width: 28, length: 38 },
    { maxWeight: Infinity, height: 18, width: 35, length: 45 },
];

// Límites de /rates
const MAX_WEIGHT_G = 25000;
const MAX_SIDE_CM = 150;

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
            relations: ['category'],
        });
        const productMap = new Map(products.map(p => [p.id, p]));

        let bagWeight = 0;                       // ropa
        let boxWeight = 0;                       // calzado
        let stackHeight = 0, boxWidth = 0, boxLength = 0;

        for (const item of items) {
            const p = productMap.get(item.productId);
            if (!p) {
                throw new BadRequestException('Uno de los productos del pedido ya no existe.');
            }
            if (!p.weightGrams) {
                throw new BadRequestException(
                    `No pudimos calcular el envío de "${p.name}". Escribinos para coordinar.`
                );
            }

            if (p.category?.packaging === PackagingType.CAJA) {
                if (!(p.heightCm && p.widthCm && p.lengthCm)) {
                    throw new BadRequestException(
                        `No pudimos calcular el envío de "${p.name}". Escribinos para coordinar.`
                    );
                }
                boxWeight += p.weightGrams * item.quantity;
                stackHeight += p.heightCm * item.quantity; // una caja por par, apiladas
                boxWidth = Math.max(boxWidth, p.widthCm);
                boxLength = Math.max(boxLength, p.lengthCm);
            } else {
                bagWeight += p.weightGrams * item.quantity;
            }
        }

        let height = stackHeight, width = boxWidth, length = boxLength;

        if (bagWeight > 0) {
            const tier = BULK_TIERS.find(t => bagWeight <= t.maxWeight)!;
            height += tier.height;
            width = Math.max(width, tier.width);
            length = Math.max(length, tier.length);
        }

        const weight = bagWeight + boxWeight;

        if (weight > MAX_WEIGHT_G || height > MAX_SIDE_CM || width > MAX_SIDE_CM || length > MAX_SIDE_CM) {
            throw new BadRequestException(
                'El pedido supera el tamaño máximo de Correo Argentino. Escribinos para coordinar el envío.'
            );
        }
        return { weight, height, width, length };
    }
}