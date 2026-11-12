import { DataSource } from 'typeorm';
import { Categories } from '../categories/categories.entity';
import { SubCategories } from '../subCategories/subCategories.entity';

export const seedSubCategories = async (dataSource: DataSource) => {
    const categoryRepository = dataSource.getRepository(Categories);
    const subCategoryRepository = dataSource.getRepository(SubCategories);

    // categoría -> sus subcategorías (ajustalo a lo que corresponda)
    const subCategories = [
        { category: 'Hombre', names: ['Remera mangas cortas', 'Jeans', 'Abrigos'] },
        { category: 'Mujer', names: ['Remera mangas cortas','Remera mangas largas', 'Jeans', 'Abrigos'] },
        { category: 'Deportivo', names: ['Remera', 'Calza'] },
    ];

    for (const group of subCategories) {
        const category = await categoryRepository.findOne({ where: { name: group.category } });

        if (!category) {
        console.log(`La categoría "${group.category}" no existe, se saltean sus subcategorías.`);
        continue;
    }

    for (const name of group.names) {
        const existing = await subCategoryRepository.findOne({
            where: { name, category: { id: category.id } },
        });

        if (!existing) {
            await subCategoryRepository.save(
            subCategoryRepository.create({ name, state: true, category }),
            );
            console.log(`La subcategoría "${name}" de ${group.category} no existe y se insertará.`);
        } else {
            console.log(`La subcategoría "${name}" de ${group.category} ya existe y no se insertará.`);
        }
        }
    }
};