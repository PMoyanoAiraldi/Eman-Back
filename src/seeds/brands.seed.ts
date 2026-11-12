import { DataSource } from 'typeorm';
import { Brands } from '../brands/brands.entity';

export const seedBrands = async (dataSource: DataSource) => {
    const repository = dataSource.getRepository(Brands);

    const brands = ['Lotus', 'NASA', 'Mistral'];

    for (const name of brands) {
        const existing = await repository.findOne({ where: { name } });

        if (!existing) {
        await repository.save(repository.create({ name, state: true }));
        console.log(`La marca "${name}" no existe y se insertará.`);
        } else {
        console.log(`La marca "${name}" ya existe y no se insertará.`);
        }
    }
};