import { UserEntity } from '../entities/user.entity';

export interface GoogleUserData {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
}

export interface IGoogleAuthRepository {
  findByGoogleId(googleId: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  upsertGoogleUser(data: GoogleUserData): Promise<UserEntity>;
}

export const GOOGLE_AUTH_REPOSITORY = 'GOOGLE_AUTH_REPOSITORY';
