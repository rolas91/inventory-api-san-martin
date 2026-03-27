import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './domain/entities/user.entity';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { GoogleAuthRepository } from './infrastructure/repositories/google-auth.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';
import { GOOGLE_AUTH_REPOSITORY } from './domain/interfaces/google-auth-repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
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
  controllers: [AuthController],
  providers: [
    AuthRepository,
    JwtStrategy,
    LoginUseCase,
    RegisterUseCase,
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
