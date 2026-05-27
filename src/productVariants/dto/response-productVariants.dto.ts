export class ResponseProductVariantsDto {

    stock: number;

    product: {
        id: string;
        name: string;
    };

    size: {
        id: string;
        name: string;
    };

    color: {
        id: string;
        name: string;
        hex: string;  
    };
}