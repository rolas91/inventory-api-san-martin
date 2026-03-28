import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './domain/entities/product.entity';
import { ProductKilosEntity } from './domain/entities/product-kilos.entity';
import { PlantaRepository } from './infrastructure/repositories/planta.repository';
import { PlantaController } from './infrastructure/controllers/planta.controller';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { GetProductKilosUseCase } from './application/use-cases/get-product-kilos.use-case';
import { CreateProductUseCase, CreateProductKilosUseCase } from './application/use-cases/create-product.use-case';
import { ImportProductsCsvUseCase } from './application/use-cases/import-products-csv.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductKilosEntity])],
  controllers: [PlantaController],
  providers: [
    PlantaRepository,
    GetProductsUseCase,
    GetProductKilosUseCase,
    CreateProductUseCase,
    CreateProductKilosUseCase,
    ImportProductsCsvUseCase,
  ],
})
export class PlantaModule {}
