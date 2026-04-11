import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserWithRoleDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo del usuario' })
  @IsString()
  @MinLength(1, { message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({ example: 'jperez', description: 'Código de usuario (único)' })
  @IsString()
  @MinLength(4, { message: 'El usuario debe tener al menos 4 caracteres' })
  user: string;

  @ApiProperty({ example: 'secret123', description: 'Contraseña' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: 'operario', description: 'Rol a asignar al usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rol?: string;
}

export class UserListItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'jperez' })
  codigoUser: string;

  @ApiProperty({ example: 'Juan Pérez' })
  nombre: string;

  @ApiProperty({ example: 'operario' })
  rol: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class MeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'jperez' })
  codigoUser: string;

  @ApiProperty({ example: 'Juan Pérez' })
  nombre: string;

  @ApiProperty({ example: 'supervisor' })
  rol: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: [String], example: ['recepciones:create', 'recepciones:update_estado'] })
  permissions: string[];
}

export class UpdateUserRoleDto {
  @ApiProperty({ example: 'supervisor', description: 'Nuevo rol del usuario' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  rol: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: false, description: 'Estado activo/inactivo del usuario' })
  @IsBoolean()
  isActive: boolean;
}
