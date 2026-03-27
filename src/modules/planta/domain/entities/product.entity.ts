import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cod_produccion', length: 100 })
  @Index()
  codProduccion: string;

  @Column({ name: 'nomb_producto', length: 300 })
  nombProducto: string;

  @Column({ name: 'num_producto', length: 100 })
  @Index()
  numProducto: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
