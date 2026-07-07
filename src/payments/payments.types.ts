export interface PaymentFormData {
    token: string;
    installments: number;
    payment_method_id: string;
    issuer_id: number;
    payer: {
        email: string;
        identification: {
            type: string;
            number: string;
        };
    };
}

export interface ProcessPaymentDto {
    formData: PaymentFormData;
    orderId: string;
}

export interface MercadoPagoWebhookQuery {
    'data.id'?: string;
    type?: string;
    id?: string;
    topic?: string;
}

export interface MercadoPagoWebhookBody {
    data?: { id?: string };
    type?: string;
}