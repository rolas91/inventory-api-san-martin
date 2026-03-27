import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RegisterDto {
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
}
