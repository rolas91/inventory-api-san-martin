import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { UserListItemDto } from '../dtos/user-management.dto';

@Injectable()
export class UpdateUserStatusUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(userId: number, isActive: boolean): Promise<UserListItemDto> {
    const user = await this.authRepository.updateStatus(userId, isActive);
    return {
      id: user.id,
      codigoUser: user.codigoUser,
      nombre: user.nombre,
      rol: this.authRepository.getUserRoleName(user),
      isActive: !!user.isActive,
    };
  }
}
