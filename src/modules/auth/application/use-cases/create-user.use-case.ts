import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { UserListItemDto } from '../dtos/user-management.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(nombre: string, codigoUser: string, password: string, rol = 'operario'): Promise<UserListItemDto> {
    const existingUser = await this.authRepository.findByCodigoUser(codigoUser);
    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    const normalizedRole = rol.trim().toLowerCase();
    const validRole = await this.authRepository.isValidRole(normalizedRole);
    if (!validRole) {
      throw new BadRequestException(`Rol inválido: ${rol}`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.authRepository.create(codigoUser, nombre, hashedPassword, normalizedRole);
    return {
      id: user.id,
      codigoUser: user.codigoUser,
      nombre: user.nombre,
      rol: this.authRepository.getUserRoleName(user),
      isActive: !!user.isActive,
    };
  }
}
