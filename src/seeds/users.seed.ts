import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { rolEnum, Users } from 'src/users/users.entity';



export const seedUsers = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(Users);

  const users = [
    {
            name: process.env.ADMIN_NAME ?? 'Administrador',
            email: process.env.ADMIN_EMAIL ?? 'emantiendaonline@gmail.com',
            password: process.env.ADMIN_PASSWORD ?? 'Admin*123',
            address: 'Entre Rios 1529',
            city: 'López',
            phone: '000000000',
            rol: rolEnum.ADMIN,
            state: true,
        },
        {
            name: 'Cliente Prueba',
            email: 'cliente@prueba.com',
            password: 'Cliente*123',
            address: 'Calle Falsa 123',
            city: 'San Carlos',
            phone: '111111111',
            rol: rolEnum.CLIENTE,
            state: true,
        },
  ];

  // Insertar usuarios si no existen
  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await userRepository.save(
        userRepository.create({
                    ...userData,
                    password: hashedPassword,
                })
      );
      console.log(`El usuario "${userData.name}" no existe y se insertará.`);
    } else {
      console.log(`El usuario "${userData.name}" ya existe y no se insertará.`);
    }
  }
};
