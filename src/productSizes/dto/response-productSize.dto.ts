export class ResponseProductSizeDto {

    stock: number;

    product: {
        id: string;
        name: string;
    };

    size: {
        id: string;
        name: string;
    };
}