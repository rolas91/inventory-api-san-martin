import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { UserListItemDto } from '../dtos/user-management.dto';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<UserListItemDto[]> {
    const users = await this.authRepository.findAllUsers();
    return users.map((u) => ({
      id: u.id,
      codigoUser: u.codigoUser,
      nombre: u.nombre,
      rol: this.authRepository.getUserRoleName(u),
      isActive: !!u.isActive,
    }));
  }
}
