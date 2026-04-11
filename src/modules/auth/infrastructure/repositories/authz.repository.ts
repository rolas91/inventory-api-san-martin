import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RoleEntity } from '../../domain/entities/role.entity';
import { PermissionEntity } from '../../domain/entities/permission.entity';
import { RolePermissionEntity } from '../../domain/entities/role-permission.entity';

@Injectable()
export class AuthzRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepo: Repository<RolePermissionEntity>,
  ) {}

  findRoles() {
    return this.roleRepo.find({ order: { name: 'ASC' } });
  }

  async findRoleWithPermissions(id: number) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Rol #${id} no encontrado`);

    const rolePermissions = await this.rolePermissionRepo.find({
      where: { roleId: id },
      relations: { permission: true },
    });

    return {
      ...role,
      permissions: rolePermissions
        .map((rp) => rp.permission)
        .filter((p) => p?.isActive)
        .map((p) => p.code)
        .sort(),
    };
  }

  createRole(name: string, description?: string) {
    return this.roleRepo.save(
      this.roleRepo.create({
        name: name.trim().toLowerCase(),
        description: description?.trim() || null,
        isActive: true,
      }),
    );
  }

  async updateRole(id: number, data: { description?: string; isActive?: boolean }) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Rol #${id} no encontrado`);
    if (typeof data.description !== 'undefined') role.description = data.description || null;
    if (typeof data.isActive !== 'undefined') role.isActive = data.isActive;
    return this.roleRepo.save(role);
  }

  async replaceRolePermissions(roleId: number, permissionCodes: string[]) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Rol #${roleId} no encontrado`);

    const uniqueCodes = [...new Set(permissionCodes.map((p) => p.trim()).filter(Boolean))];
    const permissions = uniqueCodes.length
      ? await this.permissionRepo.find({ where: { code: In(uniqueCodes) } })
      : [];

    if (permissions.length !== uniqueCodes.length) {
      const found = new Set(permissions.map((p) => p.code));
      const missing = uniqueCodes.filter((c) => !found.has(c));
      throw new NotFoundException(`Permisos inexistentes: ${missing.join(', ')}`);
    }

    await this.rolePermissionRepo.delete({ roleId });
    if (permissions.length > 0) {
      await this.rolePermissionRepo.save(
        permissions.map((permission) =>
          this.rolePermissionRepo.create({ roleId, permissionId: permission.id }),
        ),
      );
    }
  }

  findPermissions() {
    return this.permissionRepo.find({ order: { code: 'ASC' } });
  }

  async findPermissionsByRoleName(roleName: string): Promise<string[]> {
    const role = await this.roleRepo.findOne({ where: { name: roleName.trim().toLowerCase(), isActive: true } });
    if (!role) return [];

    const rolePermissions = await this.rolePermissionRepo.find({
      where: { roleId: role.id },
      relations: { permission: true },
    });

    return rolePermissions
      .map((rp) => rp.permission)
      .filter((p) => p?.isActive)
      .map((p) => p.code)
      .sort();
  }

  createPermission(code: string, description?: string) {
    return this.permissionRepo.save(
      this.permissionRepo.create({
        code: code.trim(),
        description: description?.trim() || null,
        isActive: true,
      }),
    );
  }

  async updatePermission(id: number, data: { description?: string; isActive?: boolean }) {
    const permission = await this.permissionRepo.findOne({ where: { id } });
    if (!permission) throw new NotFoundException(`Permiso #${id} no encontrado`);
    if (typeof data.description !== 'undefined') permission.description = data.description || null;
    if (typeof data.isActive !== 'undefined') permission.isActive = data.isActive;
    return this.permissionRepo.save(permission);
  }
}
