import {
  Entity, PrimaryGeneratedColumn, Column, Index,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { BodegaEntity } from './bodega.entity';

@Entity('ubicaciones')
export class UbicacionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'bodega_id' })
  @Index()
  bodegaId: number;

  @Column({ length: 20 })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BodegaEntity, (b) => b.ubicaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bodega_id' })
  bodega: BodegaEntity;
}
