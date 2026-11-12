import { DataSource } from 'typeorm';
import { Categories } from '../categories/categories.entity';

export const seedCategories = async (dataSource: DataSource) => {
    const repository = dataSource.getRepository(Categories);

    const categories = ['Hombre', 'Mujer', 'Deportivo'];

    for (const name of categories) {
        const existing = await repository.findOne({ where: { name } });

        if (!existing) {
        await repository.save(repository.create({ name, state: true }));
        console.log(`La categoría "${name}" no existe y se insertará.`);
        } else {
        console.log(`La categoría "${name}" ya existe y no se insertará.`);
        }
    }
};