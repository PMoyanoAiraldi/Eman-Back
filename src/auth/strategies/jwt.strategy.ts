import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

interface JwtPayload {
  sub: string;       // userId
  email: string;
  rol: string;
  iat?: number;      // issued at (lo agrega JWT automáticamente)
  exp?: number;      // expiration (lo agrega JWT automáticamente)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private readonly usersService: UsersService, // Inyectamos el servicio de usuarios
  ) {

    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET no está definido');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token JWT del encabezado de autorización
      ignoreExpiration: false, // Verifica que el token no esté expirado
      secretOrKey: secret, // Utiliza la clave secreta para verificar el token
    });
  }

  // Este método se ejecuta si el token es válido
  async validate(payload: JwtPayload) {
    // Extraemos el userId del payload
    const { sub: userId } = payload;

    // Buscamos el usuario en la base de datos por su id
    const user = await this.usersService.getUserForId(userId); // Debes tener un método en tu servicio de usuarios que obtenga el usuario por su id

    // Si el usuario no existe, lanzamos una excepción
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Si suspenden al usuario, sus tokens activos dejan de funcionar
    if (!user.state) {
        throw new UnauthorizedException('Tu cuenta está suspendida');
    }

    // Devolvemos el objeto completo del usuario para que esté disponible en req.user
    return user; // Aquí devolveremos el objeto completo de Usuario
  }
}

