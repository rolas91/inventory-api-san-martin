import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../../../../common/auth/permissions';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { GoogleLoginUseCase } from '../../application/use-cases/google-login.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { UpdateUserRoleUseCase } from '../../application/use-cases/update-user-role.use-case';
import { UpdateUserStatusUseCase } from '../../application/use-cases/update-user-status.use-case';
import { MeUseCase } from '../../application/use-cases/me.use-case';
import { LoginDto } from '../../application/dtos/login.dto';
import { RegisterDto } from '../../application/dtos/register.dto';
import { GoogleLoginDto } from '../../application/dtos/google-login.dto';
import { AuthResponseDto, GoogleAuthResponseDto } from '../../application/dtos/auth-response.dto';
import {
  CreateUserWithRoleDto,
  MeResponseDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UserListItemDto,
} from '../../application/dtos/user-management.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('Auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
    private readonly meUseCase: MeUseCase,
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perfil del usuario autenticado con rol y permisos efectivos' })
  @ApiResponse({ status: 200, type: MeResponseDto })
  me(@CurrentUser() currentUser: JwtPayload): Promise<MeResponseDto> {
    return this.meUseCase.execute(currentUser.sub);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Permissions(PERMISSIONS.USERS_LIST)
  @ApiOperation({ summary: 'Listar usuarios del sistema' })
  @ApiResponse({ status: 200, type: [UserListItemDto] })
  listUsers(): Promise<UserListItemDto[]> {
    return this.listUsersUseCase.execute();
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Permissions(PERMISSIONS.USERS_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear usuario y asignar rol' })
  @ApiResponse({ status: 201, type: UserListItemDto })
  @ApiResponse({ status: 409, description: 'El usuario ya existe' })
  createUserWithRole(@Body() dto: CreateUserWithRoleDto): Promise<UserListItemDto> {
    return this.createUserUseCase.execute(dto.name, dto.user, dto.password, dto.rol ?? 'operario');
  }

  @Put('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Permissions(PERMISSIONS.USERS_UPDATE_ROLE)
  @ApiOperation({ summary: 'Cambiar rol de un usuario' })
  @ApiResponse({ status: 200, type: UserListItemDto })
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<UserListItemDto> {
    return this.updateUserRoleUseCase.execute(id, dto.rol);
  }

  @Put('users/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Permissions(PERMISSIONS.USERS_UPDATE_STATUS)
  @ApiOperation({ summary: 'Activar o desactivar usuario' })
  @ApiResponse({ status: 200, type: UserListItemDto })
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UserListItemDto> {
    return this.updateUserStatusUseCase.execute(id, dto.isActive);
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
