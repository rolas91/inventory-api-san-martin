import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { GoogleLoginUseCase } from '../../application/use-cases/google-login.use-case';
import { LoginDto } from '../../application/dtos/login.dto';
import { RegisterDto } from '../../application/dtos/register.dto';
import { GoogleLoginDto } from '../../application/dtos/google-login.dto';
import { AuthResponseDto, GoogleAuthResponseDto } from '../../application/dtos/auth-response.dto';

@ApiTags('Auth')
@Controller('Auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly googleLoginUseCase: GoogleLoginUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con usuario y contraseña' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario o contraseña incorrectos' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto.user, dto.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'El usuario ya existe' })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUseCase.execute(dto.name, dto.user, dto.password);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con Google (id_token)' })
  @ApiResponse({ status: 200, type: GoogleAuthResponseDto })
  @ApiResponse({ status: 401, description: 'Token de Google inválido o expirado' })
  @ApiResponse({ status: 500, description: 'Error al contactar a Google' })
  googleLogin(@Body() dto: GoogleLoginDto): Promise<GoogleAuthResponseDto> {
    return this.googleLoginUseCase.execute(dto.idToken);
  }
}
