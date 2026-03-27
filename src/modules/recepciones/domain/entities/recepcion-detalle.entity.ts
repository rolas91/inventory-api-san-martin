import {
  Entity, PrimaryGeneratedColumn, Column, Index,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { RecepcionEntity } from './recepcion.entity';

@Entity('recepciones_detalle')
export class RecepcionDetalleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'recepcion_id' })
  @Index()
  recepcionId: number;

  @Column({ name: 'cod_producto', length: 50 })
  codProducto: string;

  @Column({ name: 'nomb_producto', length: 200 })
  nombProducto: string;

  @Column({ name: 'cantidad_recibida', default: 0 })
  cantidadRecibida: number;

  @Column({ name: 'peso_kilos', type: 'decimal', precision: 10, scale: 2, default: 0 })
  pesoKilos: number;

  @Column({ name: 'peso_libras', type: 'decimal', precision: 10, scale: 2, default: 0 })
  pesoLibras: number;

  @Column({ name: 'fecha_scan', type: 'date' })
  fechaScan: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => RecepcionEntity, (r) => r.detalle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recepcion_id' })
  recepcion: RecepcionEntity;
}
