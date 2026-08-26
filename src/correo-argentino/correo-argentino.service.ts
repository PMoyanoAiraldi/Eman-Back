import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

interface TokenResponse {
    token: string;
    expire: string; // ojo: la API devuelve "expire", no "expires" (typo del PDF)
    }

export interface RateItem {
    deliveredType: 'D' | 'S';
    productType: string;
    productName: string;
    price: number;
    deliveryTimeMin: string;
    deliveryTimeMax: string;
    }

export interface Agency {
    code: string;
    name: string;
    services: {
        packageReception: boolean;
        pickupAvailability: boolean;
    };
    location: {
        address: {
            streetName: string;
            streetNumber: string;
            city: string;
            province: string;
            provinceCode: string;
            postalCode: string;
        };
        latitude: string;
        longitude: string;
    };
    hours: Record<string, { start: string; end: string } | null>;
    status: string;
}

@Injectable()
    export class CorreoArgentinoService {
    private cachedToken: string | null = null;
    private tokenExpiresAt: number | null = null; // timestamp en ms

    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService,
    ) {}

    private get baseUrl() {
        return this.config.get<string>('CORREO_API_URL');
    }

    private decodeJwtExpiry(token: string): number {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(
        Buffer.from(payload, 'base64').toString('utf-8'),
        )as { exp: number };
        return decoded.exp * 1000; // exp viene en segundos, lo paso a ms
    }

    private async getToken(): Promise<string> {
        // Si el token cacheado sigue vigente (con 60s de margen), lo reutilizo
        if (
        this.cachedToken &&
        this.tokenExpiresAt &&
        Date.now() < this.tokenExpiresAt - 60_000
        ) {
        return this.cachedToken;
        }

        const user = this.config.getOrThrow<string>('CORREO_API_USER');
        const password = this.config.getOrThrow<string>('CORREO_API_PASSWORD');

        try {
        const response = await firstValueFrom(
            this.http.post<TokenResponse>(
            `${this.baseUrl}/token`,
            {},
            { auth: { username: user, password } },
            ),
        );

        this.cachedToken = response.data.token;
        this.tokenExpiresAt = this.decodeJwtExpiry(this.cachedToken);

        return this.cachedToken;
        } catch (error: unknown) {
            const status = axios.isAxiosError(error) ? error.response?.status : undefined;

        if (status === 402) {
            throw new HttpException(
            'No se pudo cotizar el envío para ese código postal',
            HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        throw new HttpException(
            'No se pudo autenticar con Correo Argentino',
            HttpStatus.BAD_GATEWAY,
        );
        }
    }

    async getRates(params: {
        postalCodeOrigin: string;
        postalCodeDestination: string;
        weight: number; // gramos
        height: number; // cm
        width: number;
        length: number;
        deliveredType?: 'D' | 'S'; // si se omite, devuelve ambas cotizaciones
    }): Promise<RateItem[]> {
        const token = await this.getToken();
        const customerId = this.config.get<string>('CORREO_AR_CUSTOMER_ID');
    

        try {
        const response = await firstValueFrom(
            this.http.post<{ rates: RateItem[] }>(
            `${this.baseUrl}/rates`,
            {
                customerId,
                postalCodeOrigin: params.postalCodeOrigin,
                postalCodeDestination: params.postalCodeDestination,
                deliveredType: params.deliveredType,
                dimensions: {
                weight: params.weight,
                height: params.height,
                width: params.width,
                length: params.length,
                },
            },
            { headers: { Authorization: `Bearer ${token}` } },
            ),
        );

        return response.data.rates;
        } catch (error: unknown) {
            console.error('Error en getRates:', axios.isAxiosError(error) ? error.response?.data : error);
            const status = axios.isAxiosError(error) ? error.response?.status : undefined;
            if (status === 402) {
                throw new HttpException(
                'No se pudo cotizar el envío para ese código postal',
                HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
            throw new HttpException(
                'Error al consultar Correo Argentino',
                HttpStatus.BAD_GATEWAY,
            );
        }
    }


async getAgencies(provinceCode: string): Promise<Agency[]> {
    const token = await this.getToken();
    const customerId = this.config.get<string>('CORREO_AR_CUSTOMER_ID');

    try {
        const response = await firstValueFrom(
            this.http.get<Agency[]>(`${this.baseUrl}/agencies`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { customerId, provinceCode },
            }),
        );

        // Solo mostramos sucursales activas y que reciban paquetes
        return response.data.filter(
            a => a.status === 'ACTIVE' && a.services?.packageReception,
        );
    } catch (error: unknown) {
        console.error('Error en getAgencies:', axios.isAxiosError(error) ? error.response?.data : error);
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status === 402) {
            throw new HttpException(
                'Customer ID no válido para Correo Argentino',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        throw new HttpException(
            'Error al consultar sucursales de Correo Argentino',
            HttpStatus.BAD_GATEWAY,
        );
        }
}
    
    }