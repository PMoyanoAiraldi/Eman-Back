import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { rolEnum, Users } from "./users.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@ApiTags('Users')
@Controller("users")
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos los usuarios' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios', type: [Users] })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '100',
        @Query('state') state?: string,
        @Query('rol') rol?: string,
        @Query('search') search?: string
    ) {
        const pageNumber = Number(page) || 1;
        const limitNumber = Math.min(Number(limit) || 100, 100);

        const query = this.userRepository
        .createQueryBuilder('user')
        .orderBy('user.name', 'ASC')
        .take(limitNumber)
        .skip((pageNumber - 1) * limitNumber);
                                            //SQL con un placeholder :state // { state: true } → el valor que reemplaza al placeholder
        if (state === 'active') query.andWhere('user.state = :state', { state: true });
        if (state === 'inactive') query.andWhere('user.state = :state', { state: false });
        if (rol && rol !== 'todos') query.andWhere('user.rol = :rol', { rol });
        if (search) query.andWhere('user.name ILIKE :search', { search: `%${search}%` });

        const [users, total] = await query.getManyAndCount();

        return {
            total,
            totalPages: Math.ceil(total / limitNumber),
            page: pageNumber,
            data: users,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un usuario por ID' })
    @ApiResponse({ status: 200, description: 'Usuario encontrado', type: Users })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async findOne(@Param('id') id: string): Promise<Users | null> {
            return this.usersService.getUserForId(id);
    }

    @Patch(':id/state')
    @ApiOperation({ summary: 'Cambiar estado de un usuario (activar/desactivar)' })
    @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente', type: Users })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @ApiBody({
        description: 'Estado del usuario',
        schema: {
            type: 'object',
            properties: {
                state: { type: 'boolean', example: true }
            }
        }
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(rolEnum.ADMIN)
    @ApiSecurity('bearer')
    async updateState(
        @Param('id') id: string,
        @Body('state') state: boolean
    ): Promise<Users> {
        return this.usersService.updateUserState(id, state);
    }

    


    
}