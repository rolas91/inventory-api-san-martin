import {
  Entity, PrimaryGeneratedColumn, Column, Index,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { BodegaEntity } from '../../../bodegas/domain/entities/bodega.entity';
import { RecepcionDetalleEntity } from './recepcion-detalle.entity';

@Entity('recepciones')
export class RecepcionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  numero: string;

  @Column({ length: 150 })
  proveedor: string;

  @Column({ name: 'bodega_id', type: 'integer', nullable: true })
  @Index()
  bodegaId: number | null;

  @Column({ name: 'orden_compra', type: 'varchar', length: 50, nullable: true })
  ordenCompra: string | null;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ length: 20, default: 'borrador' })
  @Index()
  estado: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ length: 50 })
  responsable: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BodegaEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bodega_id' })
  bodega: BodegaEntity;

  @OneToMany(() => RecepcionDetalleEntity, (d) => d.recepcion, { eager: false })
  detalle: RecepcionDetalleEntity[];
}
