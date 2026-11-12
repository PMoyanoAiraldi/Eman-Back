import { DataSource } from 'typeorm';
import { ProductTypes } from '../productTypes/productTypes.entity';

export const seedProductTypes = async (dataSource: DataSource) => {
    const repository = dataSource.getRepository(ProductTypes);

    const productTypes = ['Oversize', 'Regular', 'Clásica', 'Clásico', 'Chomba', 'Mom fit'];

    for (const name of productTypes) {
        const existing = await repository.findOne({ where: { name } });

        if (!existing) {
        await repository.save(repository.create({ name, state: true }));
        console.log(`El tipo de producto "${name}" no existe y se insertará.`);
        } else {
        console.log(`El tipo de producto "${name}" ya existe y no se insertará.`);
        }
    }
};