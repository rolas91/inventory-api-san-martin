import {
  Entity, PrimaryGeneratedColumn, Column, Index,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { InvPeriodoEntity } from './inv-periodo.entity';
import { InvConteoDetalleEntity } from './inv-conteo-detalle.entity';

@Entity('inv_conteos')
export class InvConteoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'periodo_id' })
  @Index()
  periodoId: number;

  @Column({ name: 'numero_conteo', default: 1 })
  numeroConteo: number;

  @Column({ length: 50 })
  responsable: string;

  @Column({ length: 20, default: 'en_progreso' })
  @Index()
  estado: string;

  @Column({ type: 'date' })
  fecha: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => InvPeriodoEntity, (p) => p.conteos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'periodo_id' })
  periodo: InvPeriodoEntity;

  @OneToMany(() => InvConteoDetalleEntity, (d) => d.conteo, { eager: false })
  detalle: InvConteoDetalleEntity[];
}
