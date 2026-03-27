import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import { IAuthRepository } from '../../domain/interfaces/auth-repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  findByCodigoUser(codigoUser: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { codigoUser, isActive: true } });
  }

  async create(codigoUser: string, nombre: string, hashedPassword: string): Promise<UserEntity> {
    const user = this.userRepo.create({ codigoUser, nombre, password: hashedPassword });
    return this.userRepo.save(user);
  }
}
