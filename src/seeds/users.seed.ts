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
            streetName: 'Entre Rios',
            streetNumber: '1529',
            city: 'López',
            provinceCode: 'S', //Santa Fe
            phone: '3404535333',
            rol: rolEnum.ADMIN,
            state: true,
        },
        {
            name: 'Cliente Prueba',
            email: 'cliente@prueba.com',
            password: 'Cliente*123',
            streetName: 'Calle Falsa',
            streetNumber: '123',
            city: 'San Carlos',
            provinceCode: 'S', //Santa Fe
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
