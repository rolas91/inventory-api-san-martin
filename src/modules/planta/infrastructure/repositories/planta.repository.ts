import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../domain/entities/product.entity';
import { ProductKilosEntity } from '../../domain/entities/product-kilos.entity';
import { IPlantaRepository } from '../../domain/interfaces/planta-repository.interface';

@Injectable()
export class PlantaRepository implements IPlantaRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductKilosEntity)
    private readonly productKilosRepo: Repository<ProductKilosEntity>,
  ) {}

  findAllProducts(): Promise<ProductEntity[]> {
    return this.productRepo.find({ where: { isActive: true }, order: { nombProducto: 'ASC' } });
  }

  findAllProductKilos(): Promise<ProductKilosEntity[]> {
    return this.productKilosRepo.find({ where: { isActive: true }, order: { codProducto: 'ASC' } });
  }

  async createProduct(data: Partial<ProductEntity>): Promise<ProductEntity> {
    const product = this.productRepo.create(data);
    return this.productRepo.save(product);
  }

  async createProductKilos(data: Partial<ProductKilosEntity>): Promise<ProductKilosEntity> {
    const item = this.productKilosRepo.create(data);
    return this.productKilosRepo.save(item);
  }
}
