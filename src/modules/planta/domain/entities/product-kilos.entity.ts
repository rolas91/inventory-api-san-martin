import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('products_kilos')
export class ProductKilosEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cod_producto', length: 100 })
  @Index()
  codProducto: string;

  @Column({ name: 'destino_rel', length: 200 })
  destinoRel: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
