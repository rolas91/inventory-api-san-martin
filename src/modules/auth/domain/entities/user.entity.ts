import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_user', unique: true, length: 100 })
  @Index()
  codigoUser: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 255 })
  password: string;

  @Column({ name: 'role_id', type: 'int' })
  roleId: number;

  @ManyToOne(() => RoleEntity, { nullable: false, eager: true })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  // ── Google OAuth fields ────────────────────────────────────────────────
  @Column({ name: 'google_id', type: 'varchar', nullable: true, unique: true, length: 255 })
  @Index()
  googleId: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true, length: 255 })
  @Index()
  email: string | null;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  picture: string | null;

  // ──────────────────────────────────────────────────────────────────────
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
