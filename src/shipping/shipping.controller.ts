import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { Agency, CorreoArgentinoService, RateItem } from '../correo-argentino/correo-argentino.service';
import { ShippingService } from './shipping.service';

interface QuoteRequestDto {
    postalCodeDestination: string;
    items: { productId: string; quantity: number }[];
    deliveredType?: 'D' | 'S'; // si no viene, asumimos domicilio 
}

@Controller('shipping')
export class ShippingController {
    constructor(
        private readonly correoArgentino: CorreoArgentinoService,
        private readonly shippingService: ShippingService
    ) {}

    @Post('quote')
    async quote(@Body() body: QuoteRequestDto): Promise<RateItem[]> {
        const pkg = await this.shippingService.calculatePackage(body.items);
        const deliveredType = body.deliveredType ?? 'D';

        const rates = await this.correoArgentino.getRates({
            postalCodeOrigin: '2255', 
            postalCodeDestination: body.postalCodeDestination,
            weight: pkg.weight,
            height: pkg.height,
            width: pkg.width,
            length: pkg.length,
            deliveredType
        });

        // De las opciones a domicilio, devolvemos la más económica
        const cheapest = rates
                .filter(r => r.deliveredType === deliveredType)
                .sort((a, b) => a.price - b.price)[0];

            return cheapest ? [cheapest] : [];
        }

        @Get('agencies')
        async agencies(@Query('provinceCode') provinceCode: string): Promise<Agency[]> {
            if (!provinceCode) {
                throw new BadRequestException('provinceCode es requerido');
            }
            return this.correoArgentino.getAgencies(provinceCode);
        }
    
}