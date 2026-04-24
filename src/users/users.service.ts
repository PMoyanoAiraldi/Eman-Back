import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "./users.entity";
import { Repository } from "typeorm";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
    @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
    ) { }

    async findAll(): Promise<Users[]> {
        return await this.usersRepository.find();
    }

    async getUserForId(id: string): Promise<Users | null>{
        return this.usersRepository.findOne({ where: {id}})
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<Partial<Users>> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Mergeamos solo los campos enviados
    Object.assign(user, updateUserDto);
    await this.usersRepository.save(user);

    const userWithoutSensitiveData = {
            name: user.name,
            email: user.email,
            address: user.address,
            city: user.city,
            phone: user.phone,
        };

    return userWithoutSensitiveData;
}

    async updateUserState(id: string, state: boolean): Promise<Users> {
        const user = await this.usersRepository.findOne({ where: { id } });
        
        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        
        user.state = state;
        return await this.usersRepository.save(user);
    }


    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ message: string }> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const isPasswordMatching = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatching) {
            throw new BadRequestException('La contraseña actual es incorrecta');
        }

        if (oldPassword === newPassword) {
            throw new BadRequestException('La nueva contraseña no puede ser igual a la actual');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await this.usersRepository.save(user);

        return { message: 'Contraseña actualizada correctamente' };
    }
}