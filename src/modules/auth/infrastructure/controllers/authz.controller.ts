import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../../../../common/auth/permissions';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import {
  CreatePermissionDto,
  CreateRoleDto,
  ReplaceRolePermissionsDto,
  UpdatePermissionDto,
  UpdateRoleDto,
} from '../../application/dtos/authz.dto';
import { AuthzRepository } from '../repositories/authz.repository';

@ApiTags('Authz')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('Authz')
export class AuthzController {
  constructor(private readonly repo: AuthzRepository) {}

  @Get('roles')
  @Permissions(PERMISSIONS.AUTHZ_MANAGE)
  @ApiOperation({ summary: 'Listar roles con permisos' })
  @ApiResponse({ status: 200 })
  async getRoles() {
    const roles = await this.repo.findRoles();
    return Promise.all(roles.map((r) => this.repo.findRoleWithPermissions(r.id)));
  }

  @Post('roles')
  @Permissions(PERMISSIONS.AUTHZ_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear rol' })
  @ApiResponse({ status: 201 })
  async createRole(@Body() dto: CreateRoleDto) {
    const role = await this.repo.createRole(dto.name, dto.description);
    if (dto.permissions && dto.permissions.length > 0) {
      await this.repo.replaceRolePermissions(role.id, dto.permissions);
    }
    return this.repo.findRoleWithPermissions(role.id);
  }

  @Put('roles/:id')
  @Permissions(PERMISSIONS.AUTHZ_MANAGE)
  @ApiOperation({ summary: 'Actualizar rol' })
  @ApiResponse({ status: 200 })
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.repo.updateRole(id, dto);
  }

  @Put('roles/:id/permissions')
  @Permissions(PERMISSIONS.AUTHZ_MANAGE)
  @ApiOperation({ summary: 'Reemplazar permisos de un rol' })
  @ApiResponse({ status: 200 })
  async replaceRolePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplaceRolePermissionsDto,
  ) {
    await this.repo.replaceRolePermissions(id, dto.permissions);
    return this.repo.findRoleWithPermissions(id);
  }

  @Get('permissions')
  @Permissions(PERMISSIONS.AUTHZ_MANAGE)
  @ApiOperation({ summary: 'Listar permisos' })
  @ApiResponse({ status: 200 })
  getPermissions() {
    return this.repo.findPermissions();
  }

  @Post('permissions')
  @Permissions(PERMISSIONS.AUTHZ_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear permiso' })
  @ApiResponse({ status: 201 })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.repo.createPermission(dto.code, dto.description);
  }

  @Put('permissions/:id')
  @Permissions(PERMISSIONS.AUTHZ_MANAGE)
  @ApiOperation({ summary: 'Actualizar permiso' })
  @ApiResponse({ status: 200 })
  updatePermission(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePermissionDto) {
    return this.repo.updatePermission(id, dto);
  }
}
