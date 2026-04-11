import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { UserListItemDto } from '../dtos/user-management.dto';

@Injectable()
export class UpdateUserRoleUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(userId: number, rol: string): Promise<UserListItemDto> {
    const normalizedRole = rol.trim().toLowerCase();
    const validRole = await this.authRepository.isValidRole(normalizedRole);
    if (!validRole) {
      throw new BadRequestException(`Rol inválido: ${rol}`);
    }

    const user = await this.authRepository.updateRole(userId, normalizedRole);
    return {
      id: user.id,
      codigoUser: user.codigoUser,
      nombre: user.nombre,
      rol: this.authRepository.getUserRoleName(user),
      isActive: !!user.isActive,
    };
  }
}
