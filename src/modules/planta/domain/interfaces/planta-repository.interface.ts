import { ProductEntity } from '../entities/product.entity';
import { ProductKilosEntity } from '../entities/product-kilos.entity';

export interface IPlantaRepository {
  findAllProducts(): Promise<ProductEntity[]>;
  findAllProductKilos(): Promise<ProductKilosEntity[]>;
  findProductByCodOrNum(codProduccion: string, numProducto: string): Promise<ProductEntity | null>;
  findProductKilosByCodAndDestino(codProducto: string, destinoRel: string): Promise<ProductKilosEntity | null>;
  createProduct(data: Partial<ProductEntity>): Promise<ProductEntity>;
  createProductKilos(data: Partial<ProductKilosEntity>): Promise<ProductKilosEntity>;
}

export const PLANTA_REPOSITORY = 'PLANTA_REPOSITORY';
