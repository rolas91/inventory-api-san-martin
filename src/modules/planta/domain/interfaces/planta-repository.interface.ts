import { ProductEntity } from '../entities/product.entity';
import { ProductKilosEntity } from '../entities/product-kilos.entity';

export interface IPlantaRepository {
  findAllProducts(): Promise<ProductEntity[]>;
  findAllProductKilos(): Promise<ProductKilosEntity[]>;
  createProduct(data: Partial<ProductEntity>): Promise<ProductEntity>;
  createProductKilos(data: Partial<ProductKilosEntity>): Promise<ProductKilosEntity>;
}

export const PLANTA_REPOSITORY = 'PLANTA_REPOSITORY';
