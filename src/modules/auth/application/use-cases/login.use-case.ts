import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(codigoUser: string, password: string): Promise<AuthResponseDto> {
    const user = await this.authRepository.findByCodigoUser(codigoUser);

    if (!user) {
      throw new NotFoundException('Usuario o contraseña incorrectos');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const payload: JwtPayload = {
      sub: user.id,
      codigoUser: user.codigoUser,
      nombre: user.nombre,
      rol: user.rol ?? 'operario',
    };

    return {
      user: { codigoUser: user.codigoUser, nombre: user.nombre },
      token: this.jwtService.sign(payload),
    };
  }
}
