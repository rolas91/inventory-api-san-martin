import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Código de usuario' })
  @IsString()
  @MinLength(4, { message: 'El usuario debe tener al menos 4 caracteres' })
  user: string;

  @ApiProperty({ example: '1234', description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password: string;
}
