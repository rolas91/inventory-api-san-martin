import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { AuthzRepository } from '../../infrastructure/repositories/authz.repository';
import { MeResponseDto } from '../dtos/user-management.dto';

@Injectable()
export class MeUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authzRepository: AuthzRepository,
  ) {}

  async execute(userId: number): Promise<MeResponseDto> {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const rol = this.authRepository.getUserRoleName(user);
    const permissions = await this.authzRepository.findPermissionsByRoleName(rol);

    return {
      id: user.id,
      codigoUser: user.codigoUser,
      nombre: user.nombre,
      rol,
      isActive: !!user.isActive,
      permissions,
    };
  }
}
