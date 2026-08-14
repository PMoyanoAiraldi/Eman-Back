import { Controller, Post, Body } from '@nestjs/common';
import { CorreoArgentinoService, RateItem } from './correo-argentino.service';

interface QuoteRequestDto {
    postalCodeDestination: string;
    weight: number;
    height: number;
    width: number;
    length: number;
}

@Controller('shipping')
export class ShippingController {
    constructor(private readonly correoArgentino: CorreoArgentinoService) {}

    @Post('quote')
    async quote(@Body() body: QuoteRequestDto): Promise<RateItem[]> {
        const rates = await this.correoArgentino.getRates({
        postalCodeOrigin: '2255', 
        postalCodeDestination: body.postalCodeDestination,
        weight: body.weight,
        height: body.height,
        width: body.width,
        length: body.length,
        deliveredType: 'D', //D = domicilio
        });

        // De las opciones a domicilio, devolvemos la más económica
        const cheapest = rates
            .filter(r => r.deliveredType === 'D')
            .sort((a, b) => a.price - b.price)[0];

        return cheapest ? [cheapest] : [];
    }
}