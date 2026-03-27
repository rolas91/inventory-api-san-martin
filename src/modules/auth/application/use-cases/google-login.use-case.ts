import {
  Injectable,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GOOGLE_AUTH_REPOSITORY } from '../../domain/interfaces/google-auth-repository.interface';
import type { IGoogleAuthRepository } from '../../domain/interfaces/google-auth-repository.interface';
import { GoogleAuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class GoogleLoginUseCase {
  private readonly logger = new Logger(GoogleLoginUseCase.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly oauthClient: any;

  constructor(
    @Inject(GOOGLE_AUTH_REPOSITORY)
    private readonly googleAuthRepo: IGoogleAuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Carga dinámica para evitar conflicto con isolatedModules + emitDecoratorMetadata
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { OAuth2Client } = require('google-auth-library');
    this.oauthClient = new OAuth2Client();
  }

  async execute(idToken: string): Promise<GoogleAuthResponseDto> {
    const googlePayload = await this.verifyToken(idToken);

    const { sub: googleId, email, name, picture, email_verified } = googlePayload;

    if (!email_verified) {
      throw new UnauthorizedException('El email de Google no está verificado');
    }

    if (!googleId || !email || !name) {
      throw new UnauthorizedException('Token de Google inválido: faltan campos requeridos');
    }

    const user = await this.googleAuthRepo.upsertGoogleUser({
      googleId,
      email,
      name,
      picture: picture ?? null,
    });

    const token = this.jwtService.sign({
      sub: user.id,
      codigoUser: user.codigoUser,
      nombre: user.nombre,
      rol: user.rol ?? 'operario',
    });

    return {
      user: {
        id: user.id,
        email: user.email ?? email,
        name: user.nombre,
        picture: user.picture,
      },
      token,
    };
  }

  private async verifyToken(idToken: string) {
    const webClientId = this.configService.get<string>('GOOGLE_WEB_CLIENT_ID');
    const androidClientId = this.configService.get<string>('GOOGLE_ANDROID_CLIENT_ID');

    const audience = [webClientId, androidClientId].filter(Boolean) as string[];

    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken,
        ...(audience.length > 0 && { audience }),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('No se pudo obtener el payload del token de Google');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;

      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Google token verification failed: ${message}`);

      if (
        message.includes('Token used too late') ||
        message.includes('Token used too early') ||
        message.includes('Invalid token signature') ||
        message.includes('Wrong number of segments')
      ) {
        throw new UnauthorizedException('Token de Google inválido o expirado');
      }

      throw new InternalServerErrorException('Error al verificar el token de Google');
    }
  }
}
