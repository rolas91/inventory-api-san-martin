import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ScanEventEntity } from './scan-event.entity';

@Entity('scan_sessions')
export class ScanSessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Index()
  uuid: string;

  @Column({ name: 'session_type', length: 30 })
  sessionType: string;

  @Column({ name: 'reference_id', type: 'integer', nullable: true })
  referenceId: number | null;

  @Column({ name: 'warehouse_id', type: 'integer', nullable: true })
  warehouseId: number | null;

  @Column({ length: 30, default: 'open' })
  status: string;

  @Column({ name: 'created_by', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ScanEventEntity, (event) => event.session)
  events: ScanEventEntity[];
}
