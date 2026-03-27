import { UserEntity } from '../entities/user.entity';

export interface IAuthRepository {
  findByCodigoUser(codigoUser: string): Promise<UserEntity | null>;
  create(codigoUser: string, nombre: string, hashedPassword: string): Promise<UserEntity>;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
