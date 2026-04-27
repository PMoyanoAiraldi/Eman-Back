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

    async findAll(page: number, limit: number, state?: string, rol?: string, search?: string): Promise<
    {
        total: number;
        totalPages: number;
        page: number;
        data: Users[];
    }
    > {
        const limitNumber = Math.min(limit, 100);

        const query = this.usersRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.name',
                'user.email',
                'user.address',
                'user.city',
                'user.phone',
                'user.state',
                'user.rol',
            ])
            .orderBy('user.name', 'ASC')
            .take(limitNumber)
            .skip((page - 1) * limitNumber);
                                                        //SQL con un placeholder :state // { state: true } → el valor que reemplaza al placeholder
        if (state === 'active') query.andWhere('user.state = :state', { state: true });
        if (state === 'inactive') query.andWhere('user.state = :state', { state: false });
        if (rol && rol !== 'todos') query.andWhere('user.rol = :rol', { rol });
        if (search) query.andWhere('user.name ILIKE :search', { search: `%${search}%` });

        const [users, total] = await query.getManyAndCount();

        return {
            total,
            totalPages: Math.ceil(total / limitNumber),
            page,
            data: users,
        };
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