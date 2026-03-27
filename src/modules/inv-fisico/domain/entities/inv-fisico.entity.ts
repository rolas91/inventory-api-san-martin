import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { InvFisicoDetailEntity } from './inv-fisico-detail.entity';

@Entity('inv_fisico')
export class InvFisicoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'consecutivo', nullable: true })
  consecutivo: number;

  @Column({ name: 'fecha', length: 50 })
  @Index()
  fecha: string;

  @Column({ name: 'cod_producto', length: 100 })
  @Index()
  codProducto: string;

  @Column({ name: 'nomb_producto', length: 300 })
  nombProducto: string;

  @Column({ name: 'peso_kilos', type: 'decimal', precision: 10, scale: 3, default: 0 })
  pesoKilos: number;

  @Column({ name: 'peso_libras', type: 'decimal', precision: 10, scale: 3, default: 0 })
  pesoLibras: number;

  @Column({ name: 'bultos', default: 0 })
  bultos: number;

  @Column({ name: 'cod_user', length: 100 })
  @Index()
  codUser: string;

  @Column({ name: 'consecutivo_caja', length: 500, default: '' })
  consecutivoCaja: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => InvFisicoDetailEntity, (detail) => detail.invFisico, {
    cascade: true,
    eager: false,
  })
  details: InvFisicoDetailEntity[];
}
