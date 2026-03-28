import {
  Entity, PrimaryGeneratedColumn, Column, Index,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { InvConteoEntity } from './inv-conteo.entity';

@Entity('inv_conteo_detalle')
export class InvConteoDetalleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conteo_id' })
  @Index()
  conteoId: number;

  @Column({ name: 'cod_producto', length: 50 })
  codProducto: string;

  @Column({ name: 'nomb_producto', length: 200 })
  nombProducto: string;

  @Column({ name: 'ubicacion_id', type: 'integer', nullable: true })
  ubicacionId: number | null;

  @Column({ name: 'peso_kilos', type: 'decimal', precision: 10, scale: 2, default: 0 })
  pesoKilos: number;

  @Column({ name: 'peso_libras', type: 'decimal', precision: 10, scale: 2, default: 0 })
  pesoLibras: number;

  @Column({ default: 0 })
  bultos: number;

  @Column({ name: 'fecha_scan', type: 'date' })
  fechaScan: string;

  @Column({ name: 'consecutivos_caja', length: 500, default: '' })
  consecutivosCaja: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => InvConteoEntity, (c) => c.detalle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conteo_id' })
  conteo: InvConteoEntity;
}
