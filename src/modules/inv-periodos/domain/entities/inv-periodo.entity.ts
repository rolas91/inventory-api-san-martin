import {
  Entity, PrimaryGeneratedColumn, Column, Index,
  CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import { BodegaEntity } from '../../../bodegas/domain/entities/bodega.entity';
import { InvConteoEntity } from './inv-conteo.entity';

@Entity('inv_periodos')
export class InvPeriodoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 20, default: 'completo' })
  tipo: string;

  @Column({ name: 'bodega_id', type: 'integer', nullable: true })
  @Index()
  bodegaId: number | null;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true, default: null })
  fechaFin: string | null;

  @Column({ length: 20, default: 'abierto' })
  @Index()
  estado: string;

  @Column({ length: 50 })
  responsable: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BodegaEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bodega_id' })
  bodega: BodegaEntity;

  @OneToMany(() => InvConteoEntity, (c) => c.periodo, { eager: false })
  conteos: InvConteoEntity[];
}
