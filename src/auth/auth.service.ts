import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Users } from "src/users/users.entity";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";
import type { Response } from 'express';
import { Order } from "src/order/order.entity";
import { RegisterFromOrderDto } from "./dto/register-from-order.dto";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        private readonly jwtService: JwtService,
        @InjectRepository(Order) 
        private orderRepository: Repository<Order>,
        private readonly usersService: UsersService,
        
    ) { }

    async createUser(registerUser: RegisterUserDto): Promise<Users> {
        const existingUser = await this.usersRepository.findOne({
            where: { email: registerUser.email },
        });

        if (existingUser) {
            throw new BadRequestException('El email ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(registerUser.password, 10);

        const newUser = this.usersRepository.create({
            ...registerUser,
            password: hashedPassword,
        });

        return this.usersRepository.save(newUser);
    }

    async register(dto: RegisterUserDto): Promise<{ message: string, user: Partial<Users> }> {
        const newUser = await this.createUser(dto)

        const safeUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            streetName: newUser.streetName,
            streetNumber: newUser.streetNumber,
            floor: newUser.floor,
            apartment: newUser.apartment,
            city: newUser.city,
            provinceCode: newUser.provinceCode,
            phone: newUser.phone,
            state: newUser.state,
            rol: newUser.rol,
        }
        return { message: 'Usuario registrado correctamente', user: safeUser}
    }

    async login(loginUser: LoginUserDto, res: Response): Promise<{ user: Partial<Users>, accessToken: string }> {
        const user = await this.usersRepository.findOne({ 
            where: {email: loginUser.email},
        });
        console.log('Usuario encontrado:', user);

        if (!user) {
            throw new HttpException('Email o contraseña incorrecto', HttpStatus.UNAUTHORIZED);
        }

        // Verificar si el usuario está habilitado
        if (!user.state) {
            throw new ForbiddenException('Tu cuenta está suspendida. Contacta al administrador.');
        }

        const isPasswordMatching = await bcrypt.compare(loginUser.password, user.password);

        if (!isPasswordMatching) {
            throw new HttpException('Email o contraseña incorrecto', HttpStatus.UNAUTHORIZED);
        }

        return this.issueSession(user, res)
    }

    private async issueSession(user: Users, res: Response): Promise<{ user: Partial<Users>, accessToken: string }> {
        // Generamos ambos tokens
        const { accessToken, refreshToken } = await this.createTokens(user);

        // Guardamos el refresh token hasheado en DB
        await this.saveRefreshToken(user.id, refreshToken);

        // El refresh token va en cookie HttpOnly (el frontend nunca lo ve)
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días en ms
            path: '/auth/refresh',
        });

        //No devolvemos ni password, ni refreshToken, ni refreshTokenExpirity
        const userWithoutSensitiveData = {
            id: user.id,
            name: user.name,
            email: user.email,
            streetName: user.streetName,
            streetNumber: user.streetNumber,
            floor: user.floor,
            apartment: user.apartment,
            city: user.city,
            provinceCode: user.provinceCode,
            phone: user.phone,
            state: user.state,
            rol: user.rol,
        };

        return {
            user: userWithoutSensitiveData,
            accessToken, // ← solo el access token va en el body
        };
    }


    private async createTokens(user: Users): Promise<{ accessToken: string, refreshToken: string }> {
        const payload = {
            sub: user.id,      // ← sub no id
            email: user.email,
            rol: user.rol,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.NODE_ENV === 'production' ? '15m' : '2h',
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '30d',
            }),
        ]);

        return { accessToken, refreshToken };
    }

    private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const hashed = await bcrypt.hash(refreshToken, 10);
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);

        await this.usersRepository.update(userId, {
            refreshToken: hashed,
            refreshTokenExpiry: expiry,
        });
    }

    

    async logout(userId: string, res: Response): Promise<{ message: string }> {
    // Limpiamos el refresh token en DB
    await this.usersRepository.update(userId, {
        refreshToken: null,
        refreshTokenExpiry: null,
    });

    // Limpiamos la cookie. Cast explícito para que TypeScript sepa qué es res
    res.clearCookie('refresh_token', { path: '/auth/refresh' });

    return { message: 'Sesión cerrada correctamente' };
}


async refresh(refreshToken: string, res: Response): Promise<{ accessToken: string }> {
    if (!refreshToken) {
        throw new UnauthorizedException('No hay refresh token');
    }

    // Verificamos que el JWT sea válido
    let payload: { sub: string; email: string; rol: string };
    try {
        payload = await this.jwtService.verifyAsync(refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET,
        });
    } catch {
        throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Buscamos el usuario en DB
    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });

    if (!user || !user.refreshToken || !user.refreshTokenExpiry) {
        throw new UnauthorizedException('Sesión no válida');
    }

    // Verificamos que no haya expirado en DB
    if (new Date() > user.refreshTokenExpiry) {
        throw new UnauthorizedException('Sesión expirada, inicia sesión nuevamente');
    }

    // Comparamos el token recibido con el hasheado en DB
    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatches) {
        throw new UnauthorizedException('Refresh token no válido');
    }

    // Rotamos el refresh token — generamos uno nuevo cada vez
    const { accessToken, refreshToken: newRefreshToken } = await this.createTokens(user);
    await this.saveRefreshToken(user.id, newRefreshToken);

    res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/auth/refresh',
    });

    return { accessToken };
}

    async registerFromOrder(dto: RegisterFromOrderDto, res: Response) {
        const order = await this.orderRepository.findOne({
            where: { id: dto.orderId },
            relations: ['user'],
        })

        if (!order) throw new NotFoundException('Orden no encontrada')
        if (order.user) throw new BadRequestException('Esta orden ya está asociada a una cuenta')
        if (order.guestEmail?.toLowerCase() !== dto.email.toLowerCase()) {
            throw new ForbiddenException('El email no coincide con el de la orden')
        }

        const newUser = await this.createUser(dto)

        order.user = newUser
        await this.orderRepository.save(order)

        return this.issueSession(newUser, res)
    }
    
    async getMe(userId: string) {
        return this.usersService.getSafeUserById(userId)
    }
    
    }