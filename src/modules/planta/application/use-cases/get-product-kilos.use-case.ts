import { Injectable } from '@nestjs/common';
import { PlantaRepository } from '../../infrastructure/repositories/planta.repository';
import { ProductKilosResponseDto } from '../dtos/product-response.dto';

@Injectable()
export class GetProductKilosUseCase {
  constructor(private readonly plantaRepository: PlantaRepository) {}

  async execute(): Promise<ProductKilosResponseDto[]> {
    const items = await this.plantaRepository.findAllProductKilos();
    return items.map((pk) => ({
      codProducto: pk.codProducto,
      destinoRel: pk.destinoRel,
    }));
  }
}
