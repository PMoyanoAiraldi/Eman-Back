import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { Request } from 'express';

@ApiTags("Auth")
@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService,
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'Crear un nuevo cliente' })
    @ApiResponse({ status: 201, description: 'Cliente creado exitosamente', type: RegisterUserDto })
    @ApiResponse({ status: 500, description: 'Error inesperado al crear el cliente' })
    @ApiBody({
        description: 'Datos para registrar el cliente',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
                address: { type: 'string' },
                city: { type: 'string' },
                phone: { type: 'string' },
            },
        },
    })
        async createUser(@Body() createUser: RegisterUserDto) {
        const user = await this.authService.register(createUser)

        return {
            message: `Cliente creado exitosamente`, user
        };
    }

    @Post('login')
    @ApiOperation({ summary: 'Loguear un usuario' })
    @ApiResponse({ status: 200, description: 'Usuario logueado exitosamente', type: LoginUserDto })
    @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
    @ApiBody({
        description: 'Datos para iniciar sesion',
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                password: { type: 'string' },
            },
        },
})
    async signIn(
        @Body() credentials: LoginUserDto,
        @Res({ passthrough: true }) res: any, // ← passthrough permite que NestJS siga manejando la respuesta
    ) {
        return  await  this.authService.login(credentials, res)
        
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Renovar access token' })
    @ApiResponse({ status: 200, description: 'Token renovado exitosamente' })
    async refresh(
        @Req() req: any,
        @Res({ passthrough: true }) res: any,
    ) {
        const refreshToken = (req as Request).cookies['refresh_token'] as string;
        return await this.authService.refresh(refreshToken, res);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Cerrar sesión' })
    async logout(
        @Req() req: any,
        @Res({ passthrough: true }) res: any,
    ) {
        const userId = (req as Request & { user: { id: string } }).user.id;
        return await this.authService.logout(userId, res);
    }


}