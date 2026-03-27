import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(nombre: string, codigoUser: string, password: string): Promise<AuthResponseDto> {
    const existingUser = await this.authRepository.findByCodigoUser(codigoUser);
    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.authRepository.create(codigoUser, nombre, hashedPassword);

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
