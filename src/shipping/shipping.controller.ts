import { Controller, Post, Body } from '@nestjs/common';
import { CorreoArgentinoService, RateItem } from '../correo-argentino/correo-argentino.service';
import { ShippingService } from './shipping.service';

interface QuoteRequestDto {
    postalCodeDestination: string;
    items: { productId: string; quantity: number }[];
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

        const rates = await this.correoArgentino.getRates({
            postalCodeOrigin: '2255', 
            postalCodeDestination: body.postalCodeDestination,
            weight: pkg.weight,
            height: pkg.height,
            width: pkg.width,
            length: pkg.length,
            deliveredType: 'D', //D = domicilio
            });

            // De las opciones a domicilio, devolvemos la más económica
            const cheapest = rates
                .filter(r => r.deliveredType === 'D')
                .sort((a, b) => a.price - b.price)[0];

            return cheapest ? [cheapest] : [];
        }
}