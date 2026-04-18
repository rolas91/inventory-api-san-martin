import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  findAllProducts(): Promise<ProductEntity[]> {
    return this.productRepo.find({ where: { isActive: true }, order: { nombProducto: 'ASC' } });
  }

  findAllProductKilos(): Promise<ProductKilosEntity[]> {
    return this.productKilosRepo.find({ where: { isActive: true }, order: { codProducto: 'ASC' } });
  }

  findProductByCodOrNum(codProduccion: string, numProducto: string): Promise<ProductEntity | null> {
    return this.productRepo.findOne({
      where: [{ codProduccion }, { numProducto }],
    });
  }

  findProductKilosByCodAndDestino(
    codProducto: string,
    destinoRel: string,
  ): Promise<ProductKilosEntity | null> {
    return this.productKilosRepo.findOne({
      where: { codProducto, destinoRel },
    });
  }

  async createProduct(data: Partial<ProductEntity>): Promise<ProductEntity> {
    const codProduccion = data.codProduccion?.trim();
    const numProducto = data.numProducto?.trim();
    if (!codProduccion || !numProducto) {
      const product = this.productRepo.create(data);
      return this.productRepo.save(product);
    }

    const existing = await this.findProductByCodOrNum(codProduccion, numProducto);
    if (existing) return existing;

    const product = this.productRepo.create(data);
    try {
      return await this.productRepo.save(product);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        const found = await this.findProductByCodOrNum(codProduccion, numProducto);
        if (found) return found;

        // Si el duplicado viene por PK/secuencia desalineada, la re-alineamos y reintentamos.
        await this.alignSequenceToMaxId('products');
        const retried = await this.productRepo.save(product);
        return retried;
      }
      throw error;
    }
  }

  async createProductKilos(data: Partial<ProductKilosEntity>): Promise<ProductKilosEntity> {
    const codProducto = data.codProducto?.trim();
    const destinoRel = data.destinoRel?.trim();
    if (!codProducto || !destinoRel) {
      const item = this.productKilosRepo.create(data);
      return this.productKilosRepo.save(item);
    }

    const existing = await this.findProductKilosByCodAndDestino(codProducto, destinoRel);
    if (existing) return existing;

    const item = this.productKilosRepo.create(data);
    try {
      return await this.productKilosRepo.save(item);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        const found = await this.findProductKilosByCodAndDestino(codProducto, destinoRel);
        if (found) return found;

        // Duplicado por PK (products_kilos_pkey): corregir secuencia y reintentar.
        await this.alignSequenceToMaxId('products_kilos');
        const retried = await this.productKilosRepo.save(item);
        return retried;
      }
      throw error;
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    const maybe = error as { code?: string; driverError?: { code?: string } } | undefined;
    return maybe?.driverError?.code === '23505' || maybe?.code === '23505';
  }

  private async alignSequenceToMaxId(tableName: 'products' | 'products_kilos'): Promise<void> {
    await this.dataSource.query(
      `
      SELECT setval(
        pg_get_serial_sequence('"${tableName}"', 'id'),
        COALESCE((SELECT MAX(id) FROM "${tableName}"), 0) + 1,
        false
      )
      `,
    );
  }
}
