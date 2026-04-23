import { Module, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedUsers } from './users.seed';
// import { seedProduct } from './product.seed';
// import { seedLinea } from './linea.seed';
// import { seedRubro } from './rubro.seed';
// import { seedMarca } from './marca.seed';
// import { seedPrecio } from './precio.seed';

@Module({})
export class SeedModule implements OnModuleInit {
    constructor(private dataSource: DataSource) {}

    async onModuleInit() {

        await seedUsers(this.dataSource); 
        // await seedLinea(this.dataSource);
        // await seedMarca(this.dataSource);
        // await seedRubro(this.dataSource);
        
        // await seedProduct(this.dataSource);
        // await seedPrecio(this.dataSource);
        
    }
}
