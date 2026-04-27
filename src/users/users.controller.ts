import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { rolEnum, Users } from "./users.entity";
import { UserResponseDto } from "./dto/response-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { RequestWithUser } from '../auth/guards/roles.guard'

@ApiTags('Users')
@Controller("users")
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos los usuarios' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios', type: [UserResponseDto] })
    @ApiQuery({ name: 'page', required: false, example: '1' })
    @ApiQuery({ name: 'limit', required: false, example: '100' })
    @ApiQuery({ name: 'state', required: false, enum: ['active', 'inactive'] })
    @ApiQuery({ name: 'rol', required: false, enum: rolEnum })
    @ApiQuery({ name: 'search', required: false })
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
        return this.usersService.findAll(
            Number(page) || 1,
            Number(limit) || 100,
            state,
            rol,
            search,
        );
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

    @Patch('profile')
    @ApiOperation({ summary: 'Actualizar datos del usuario logueado' })
    @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
    @ApiBody({
        description: 'Datos a actualizar',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                address: { type: 'string' },
                city: { type: 'string' },
                phone: { type: 'string' },
            }
        }
    })
    @UseGuards(JwtAuthGuard)
    @ApiSecurity('bearer')
    async updateProfile(
        @Req() req: any,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const userId = (req as RequestWithUser).user.id; // ← ID viene del token, no del parámetro. Usamos la interface creada en roles.guard
        return this.usersService.updateUser(userId, updateUserDto);
    }
        


    
}