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