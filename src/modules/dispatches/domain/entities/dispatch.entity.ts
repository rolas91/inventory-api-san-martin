import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('dispatches')
export class DispatchEntity {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 30, unique: true }) numero: string;
  @Column({ length: 200 }) destino: string;
  @Column({ name: 'warehouse_id', type: 'integer', nullable: true }) warehouseId: number | null;
  @Column({ name: 'reference_document', type: 'varchar', length: 150, nullable: true }) referenceDocument: string | null;
  @Column({ type: 'date' }) @Index() fecha: string;
  @Column({ length: 30, default: 'draft' }) @Index() estado: string;
  @Column({ type: 'text', nullable: true }) observaciones: string | null;
  @Column({ length: 100 }) responsable: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
