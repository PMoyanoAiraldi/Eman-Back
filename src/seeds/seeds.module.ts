import { Module, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedUsers } from './users.seed';
import { seedBrands } from './brands.seed';
import { seedProductTypes } from './productTypes.seed';
import { seedSubCategories } from './subCategories.seed';
import { seedCategories } from './categories.seed';
import { seedSizes } from './sizes.seed';

@Module({})
export class SeedModule implements OnModuleInit {
    constructor(private dataSource: DataSource) {}

    async onModuleInit() {
        await seedCategories(this.dataSource);
        await seedSubCategories(this.dataSource);
        await seedProductTypes(this.dataSource);
        await seedBrands(this.dataSource);
        await seedSizes(this.dataSource);
        await seedUsers(this.dataSource);         
    }
}
