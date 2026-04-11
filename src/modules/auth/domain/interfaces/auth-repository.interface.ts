import { UserEntity } from '../entities/user.entity';

export interface IAuthRepository {
  findByCodigoUser(codigoUser: string): Promise<UserEntity | null>;
  create(codigoUser: string, nombre: string, hashedPassword: string, rol?: string): Promise<UserEntity>;
  findAllUsers(): Promise<UserEntity[]>;
  isValidRole(roleName: string): Promise<boolean>;
  getUserRoleName(user: UserEntity): string;
  findById(id: number): Promise<UserEntity | null>;
  updateRole(id: number, roleName: string): Promise<UserEntity>;
  updateStatus(id: number, isActive: boolean): Promise<UserEntity>;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
