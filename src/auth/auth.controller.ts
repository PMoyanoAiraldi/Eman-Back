import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { Request, Response} from 'express';
import { RegisterFromOrderDto } from "./dto/register-from-order.dto";

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
                streetName: { type: 'string' },
                streetNumber: { type: 'string' },
                floor: { type: 'string' },
                apartment: { type: 'string' },
                city: { type: 'string' },
                provinceCode: { type: 'string'},
                phone: { type: 'string' },
            },
        },
    })
    async createUser(@Body() createUser: RegisterUserDto) {
        return await this.authService.register(createUser)

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
        @Res({ passthrough: true }) res: Response, // ← passthrough permite que NestJS siga manejando la respuesta
    ) {
        return  await  this.authService.login(credentials, res)
        
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Renovar access token' })
    @ApiResponse({ status: 200, description: 'Token renovado exitosamente' })
    async refresh(
        @Req() req: any,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = (req as Request).cookies['refresh_token'] as string;
        return await this.authService.refresh(refreshToken, res);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cerrar sesión' })
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userId = (req as Request & { user: { id: string } }).user.id;
        return await this.authService.logout(userId, res);
    }

    @Post('register-from-order')
    @ApiOperation({ summary: 'Registrar un cliente a partir de una orden de guest checkout y vincularla a su cuenta nueva' })
    @ApiResponse({ status: 201, description: 'Cuenta creada y orden vinculada' })
    @ApiResponse({ status: 400, description: 'La orden ya está asociada a una cuenta' })
    @ApiResponse({ status: 403, description: 'El email no coincide con el de la orden' })
    @ApiResponse({ status: 404, description: 'Orden no encontrada' })
    async registerFromOrder(
        @Body() dto: RegisterFromOrderDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        return await this.authService.registerFromOrder(dto, res)
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener los datos del usuario autenticado' })
    async getMe(@Req() req: any) {
        const userId = (req as Request & { user: { id: string } }).user.id;
            return await this.authService.getMe(userId)
}


}