import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  GoogleUserData,
  IGoogleAuthRepository,
} from '../../domain/interfaces/google-auth-repository.interface';

@Injectable()
export class GoogleAuthRepository implements IGoogleAuthRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  findByGoogleId(googleId: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { googleId, isActive: true } });
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { email, isActive: true } });
  }

  async upsertGoogleUser(data: GoogleUserData): Promise<UserEntity> {
    // Buscar por googleId primero, luego por email (para vincular cuentas existentes)
    let user =
      (await this.findByGoogleId(data.googleId)) ??
      (await this.findByEmail(data.email));

    if (user) {
      // Actualizar datos frescos de Google
      user.googleId = data.googleId;
      user.email = data.email;
      user.nombre = data.name;
      user.picture = data.picture;
      return this.userRepo.save(user);
    }

    // Nuevo usuario via Google: codigoUser = email (identificador interno)
    const newUser = this.userRepo.create({
      codigoUser: data.email,
      nombre: data.name,
      password: '',          // Sin contraseña; login solo vía Google
      googleId: data.googleId,
      email: data.email,
      picture: data.picture,
      isActive: true,
    });

    return this.userRepo.save(newUser);
  }
}
