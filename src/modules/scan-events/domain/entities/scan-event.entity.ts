import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ScanSessionEntity } from './scan-session.entity';

@Entity('scan_events')
export class ScanEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Index()
  uuid: string;

  @Column({ name: 'session_id' })
  @Index()
  sessionId: number;

  @Column({ length: 30 })
  operation: string;

  @Column({ name: 'quantity_sign', type: 'smallint', default: 1 })
  quantitySign: number;

  @Column({ name: 'product_code', length: 100 })
  @Index()
  productCode: string;

  @Column({ name: 'product_name', length: 300, default: '' })
  productName: string;

  @Column({ name: 'box_sequence', type: 'varchar', length: 100, nullable: true })
  @Index()
  boxSequence: string | null;

  @Column({ name: 'original_weight', type: 'decimal', precision: 12, scale: 3, default: 0 })
  originalWeight: number;

  @Column({ name: 'original_unit', length: 20, default: 'KG' })
  originalUnit: string;

  @Column({ name: 'weight_kg', type: 'decimal', precision: 12, scale: 3, default: 0 })
  weightKg: number;

  @Column({ name: 'weight_lb', type: 'decimal', precision: 12, scale: 3, default: 0 })
  weightLb: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lot: string | null;

  @Column({ name: 'sub_lot', type: 'varchar', length: 100, nullable: true })
  subLot: string | null;

  @Column({ name: 'destination_code', type: 'varchar', length: 100, nullable: true })
  destinationCode: string | null;

  @Column({ name: 'pieces_count', type: 'integer', nullable: true })
  piecesCount: number | null;

  @Column({ type: 'integer', nullable: true })
  sequence: number | null;

  @Column({ name: 'location_id', type: 'integer', nullable: true })
  locationId: number | null;

  @Column({ name: 'reference_document', type: 'varchar', length: 150, nullable: true })
  referenceDocument: string | null;

  @Column({ name: 'performed_by', length: 100 })
  performedBy: string;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;

  @Column({ name: 'reverses_event_uuid', type: 'uuid', nullable: true })
  reversesEventUuid: string | null;

  @Column({ name: 'raw_barcode', type: 'text', nullable: true })
  rawBarcode: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ScanSessionEntity, (session) => session.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: ScanSessionEntity;
}
