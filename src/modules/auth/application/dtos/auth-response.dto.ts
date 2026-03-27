import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'jperez' })
  codigoUser: string;

  @ApiProperty({ example: 'Juan Pérez' })
  nombre: string;
}

export class AuthResponseDto {
  @ApiProperty()
  user: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;
}

// ── Google OAuth response ──────────────────────────────────────────────────
export class GoogleUserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'juan.perez@gmail.com' })
  email: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name: string;

  @ApiPropertyOptional({ example: 'https://lh3.googleusercontent.com/...' })
  picture: string | null;
}

export class GoogleAuthResponseDto {
  @ApiProperty()
  user: GoogleUserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;
}

