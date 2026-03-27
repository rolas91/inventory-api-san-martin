import { Injectable } from '@nestjs/common';
import { PlantaRepository } from '../../infrastructure/repositories/planta.repository';
import { ProductResponseDto } from '../dtos/product-response.dto';

@Injectable()
export class GetProductsUseCase {
  constructor(private readonly plantaRepository: PlantaRepository) {}

  async execute(): Promise<ProductResponseDto[]> {
    const products = await this.plantaRepository.findAllProducts();
    return products.map((p) => ({
      codProduccion: p.codProduccion,
      nombProducto: p.nombProducto,
      numProducto: p.numProducto,
    }));
  }
}
