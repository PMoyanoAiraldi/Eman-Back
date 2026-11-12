import { DataSource } from 'typeorm';
import { Sizes } from '../sizes/sizes.entity';

export const seedSizes = async (dataSource: DataSource) => {
    const repository = dataSource.getRepository(Sizes);

    const sizes = ['Talle único', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

    for (const name of sizes) {
        const existing = await repository.findOne({ where: { name } });

        if (!existing) {
        await repository.save(repository.create({ name, state: true }));
        console.log(`El talle "${name}" no existe y se insertará.`);
        } else {
        console.log(`El talle "${name}" ya existe y no se insertará.`);
        }
    }
};