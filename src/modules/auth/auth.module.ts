import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './domain/entities/user.entity';
import { RoleEntity } from './domain/entities/role.entity';
import { PermissionEntity } from './domain/entities/permission.entity';
import { RolePermissionEntity } from './domain/entities/role-permission.entity';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { GoogleAuthRepository } from './infrastructure/repositories/google-auth.repository';
import { AuthzRepository } from './infrastructure/repositories/authz.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthzController } from './infrastructure/controllers/authz.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserRoleUseCase } from './application/use-cases/update-user-role.use-case';
import { UpdateUserStatusUseCase } from './application/use-cases/update-user-status.use-case';
import { MeUseCase } from './application/use-cases/me.use-case';
import { GOOGLE_AUTH_REPOSITORY } from './domain/interfaces/google-auth-repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity, PermissionEntity, RolePermissionEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '7d') as any },
      }),
    }),
  ],
  controllers: [AuthController, AuthzController],
  providers: [
    AuthRepository,
    AuthzRepository,
    JwtStrategy,
    LoginUseCase,
    RegisterUseCase,
    ListUsersUseCase,
    CreateUserUseCase,
    UpdateUserRoleUseCase,
    UpdateUserStatusUseCase,
    MeUseCase,
    GoogleAuthRepository,
    {
      provide: GOOGLE_AUTH_REPOSITORY,
      useExisting: GoogleAuthRepository,
    },
    GoogleLoginUseCase,
  ],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
