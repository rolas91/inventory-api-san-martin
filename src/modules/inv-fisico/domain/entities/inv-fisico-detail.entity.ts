import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { InvFisicoEntity } from './inv-fisico.entity';

@Entity('inv_fisico_details')
export class InvFisicoDetailEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InvFisicoEntity, (inv) => inv.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inv_fisico_id' })
  invFisico: InvFisicoEntity;

  @Column({ name: 'inv_fisico_id' })
  invFisicoId: number;

  @Column({ name: 'numero_producto', nullable: true })
  numeroProducto: number;

  @Column({ name: 'cod_producto', length: 100, nullable: true })
  codProducto: string;

  @Column({ name: 'nomb_producto', length: 300, nullable: true })
  nombProducto: string;

  @Column({ name: 'fecha_deshuese', length: 50, nullable: true })
  fechaDeshuese: string;

  @Column({ name: 'peso', type: 'decimal', precision: 10, scale: 3, nullable: true })
  peso: number;

  @Column({ name: 'unidad_medida', length: 20, nullable: true })
  unidadMedida: string;

  @Column({ name: 'consecutivo_caja', length: 100, nullable: true })
  consecutivoCaja: string;

  @Column({ name: 'num_maquinas', length: 50, nullable: true })
  numMaquinas: string;

  @Column({ name: 'lote', length: 100, nullable: true })
  lote: string;

  @Column({ name: 'sub_lote', length: 100, nullable: true })
  subLote: string;

  @Column({ name: 'cod_destino', length: 100, nullable: true })
  codDestino: string;

  @Column({ name: 'cant_piezas', nullable: true })
  cantPiezas: number;

  @Column({ name: 'secuencia', nullable: true })
  secuencia: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
