import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import { RoleEntity } from '../../domain/entities/role.entity';
import { IAuthRepository } from '../../domain/interfaces/auth-repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  private async resolveRole(roleName: string): Promise<RoleEntity> {
    const role = await this.roleRepo.findOne({
      where: { name: roleName.trim().toLowerCase(), isActive: true },
    });
    if (!role) {
      throw new NotFoundException(`Rol no encontrado: ${roleName}`);
    }
    return role;
  }

  getUserRoleName(user: UserEntity): string {
    return user.role?.name ?? 'operario';
  }

  findByCodigoUser(codigoUser: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { codigoUser, isActive: true }, relations: { role: true } });
  }

  async create(
    codigoUser: string,
    nombre: string,
    hashedPassword: string,
    rol = 'operario',
  ): Promise<UserEntity> {
    const role = await this.resolveRole(rol);
    const user = this.userRepo.create({
      codigoUser,
      nombre,
      password: hashedPassword,
      roleId: role.id,
      role,
    });
    return this.userRepo.save(user);
  }

  findAllUsers(): Promise<UserEntity[]> {
    return this.userRepo.find({ relations: { role: true }, order: { nombre: 'ASC' } });
  }

  async isValidRole(roleName: string): Promise<boolean> {
    const role = await this.roleRepo.findOne({
      where: { name: roleName.trim().toLowerCase(), isActive: true },
    });
    return !!role;
  }

  findById(id: number): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { id }, relations: { role: true } });
  }

  async updateRole(id: number, roleName: string): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);
    const role = await this.resolveRole(roleName);
    user.roleId = role.id;
    user.role = role;
    return this.userRepo.save(user);
  }

  async updateStatus(id: number, isActive: boolean): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);
    user.isActive = isActive;
    return this.userRepo.save(user);
  }
}
