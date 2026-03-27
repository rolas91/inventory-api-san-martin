import { Injectable } from '@nestjs/common';
import { PlantaRepository } from '../../infrastructure/repositories/planta.repository';
import { CreateProductDto, CreateProductKilosDto } from '../dtos/create-product.dto';
import { ProductResponseDto, ProductKilosResponseDto } from '../dtos/product-response.dto';

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly plantaRepository: PlantaRepository) {}

  async execute(dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.plantaRepository.createProduct(dto);
    return {
      codProduccion: product.codProduccion,
      nombProducto: product.nombProducto,
      numProducto: product.numProducto,
    };
  }
}

@Injectable()
export class CreateProductKilosUseCase {
  constructor(private readonly plantaRepository: PlantaRepository) {}

  async execute(dto: CreateProductKilosDto): Promise<ProductKilosResponseDto> {
    const item = await this.plantaRepository.createProductKilos(dto);
    return {
      codProducto: item.codProducto,
      destinoRel: item.destinoRel,
    };
  }
}
