import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import type { AppPermission } from '../auth/permissions';
import { PERMISSIONS } from '../auth/permissions';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';

type RolePermissionsMap = Record<string, string[]>;

const DEFAULT_ROLE_PERMISSIONS: RolePermissionsMap = {
  admin: ['*'],
  supervisor: [
    // Inventario
    PERMISSIONS.INV_PERIODOS_CREATE,
    PERMISSIONS.INV_PERIODOS_UPDATE_ESTADO,
    PERMISSIONS.INV_PERIODOS_CREATE_CONTEO,
    PERMISSIONS.INV_CONTEOS_UPDATE_ESTADO,
    PERMISSIONS.INV_CONTEOS_BATCH_DETALLE,
    PERMISSIONS.INV_CONTEOS_SYNC_COMPLETO,
    // Recepciones
    PERMISSIONS.RECEPCIONES_CREATE,
    PERMISSIONS.RECEPCIONES_UPDATE_ESTADO,
    PERMISSIONS.RECEPCIONES_BATCH_DETALLE,
    PERMISSIONS.RECEPCIONES_SYNC_COMPLETA,
    // Planta
    PERMISSIONS.PLANTA_CREATE_PRODUCT,
    PERMISSIONS.PLANTA_IMPORT_PRODUCTS,
    PERMISSIONS.PLANTA_IMPORT_PRODUCTS_KILOS,
  ],
  operario: [
    PERMISSIONS.INV_CONTEOS_BATCH_DETALLE,
    PERMISSIONS.INV_CONTEOS_SYNC_COMPLETO,
    PERMISSIONS.RECEPCIONES_BATCH_DETALLE,
    PERMISSIONS.RECEPCIONES_SYNC_COMPLETA,
  ],
};

@Injectable()
export class RolesGuard implements CanActivate {
  private cachedRolePermissions: RolePermissionsMap | null = null;
  private cachedAt = 0;

  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  private async resolveRolePermissionsFromDb(): Promise<RolePermissionsMap | null> {
    try {
      const rows = await this.dataSource.query(`
        SELECT r.name AS role, p.code AS permission
        FROM roles r
        JOIN role_permissions rp ON rp.role_id = r.id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE r."isActive" = true AND p."isActive" = true
      `) as Array<{ role: string; permission: string }>;

      if (!rows.length) return null;

      const map: RolePermissionsMap = {};
      for (const row of rows) {
        const role = String(row.role ?? '').trim().toLowerCase();
        const permission = String(row.permission ?? '').trim();
        if (!role || !permission) continue;
        if (!map[role]) map[role] = [];
        map[role].push(permission);
      }

      return Object.keys(map).length > 0 ? map : null;
    } catch {
      return null;
    }
  }

  private async resolveRolePermissions(): Promise<RolePermissionsMap> {
    const now = Date.now();
    if (this.cachedRolePermissions && now - this.cachedAt < 30_000) {
      return this.cachedRolePermissions;
    }

    // Prioridad 1: DB (dinámico)
    const fromDb = await this.resolveRolePermissionsFromDb();
    if (fromDb) {
      this.cachedRolePermissions = fromDb;
      this.cachedAt = now;
      return fromDb;
    }

    // Prioridad 2: JSON de env (compatibilidad temporal)
    const fromEnv = this.resolveRolePermissionsFromEnv();
    this.cachedRolePermissions = fromEnv;
    this.cachedAt = now;
    return fromEnv;
  }

  private resolveRolePermissionsFromEnv(): RolePermissionsMap {
    const raw = this.configService.get<string>('AUTH_ROLE_PERMISSIONS_JSON');
    if (!raw) return DEFAULT_ROLE_PERMISSIONS;

    try {
      const parsed = JSON.parse(raw) as RolePermissionsMap;
      return parsed && typeof parsed === 'object' ? parsed : DEFAULT_ROLE_PERMISSIONS;
    } catch {
      return DEFAULT_ROLE_PERMISSIONS;
    }
  }

  private async hasPermission(role: string, permission: AppPermission): Promise<boolean> {
    const rolePermissions = (await this.resolveRolePermissions())[role] ?? [];
    return rolePermissions.includes('*') || rolePermissions.includes(permission);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<AppPermission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();
    const userRole = user?.rol as string | undefined;

    if ((!requiredRoles || requiredRoles.length === 0) && (!requiredPermissions || requiredPermissions.length === 0)) {
      return true;
    }

    if (!userRole) {
      throw new ForbiddenException('Sin rol asignado');
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const checks = await Promise.all(
        requiredPermissions.map(async (permission) => ({
          permission,
          allowed: await this.hasPermission(userRole, permission),
        })),
      );
      const missing = checks.filter((c) => !c.allowed).map((c) => c.permission);
      if (missing.length > 0) {
        throw new ForbiddenException(
          `Permisos faltantes: ${missing.join(', ')}`,
        );
      }
      return true;
    }

    const hasRole = (requiredRoles ?? []).includes(userRole as UserRole);
    if (!hasRole && requiredRoles && requiredRoles.length > 0) {
      throw new ForbiddenException(
        `Se requiere uno de los roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
