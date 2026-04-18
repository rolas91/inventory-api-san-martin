import { Injectable } from '@nestjs/common';
import { PlantaRepository } from '../../infrastructure/repositories/planta.repository';
import { CreateProductDto, CreateProductKilosDto } from '../dtos/create-product.dto';
import {
  CreateProductFullResponseDto,
  ProductKilosResponseDto,
  ProductResponseDto,
} from '../dtos/product-response.dto';

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly plantaRepository: PlantaRepository) {}

  async execute(dto: CreateProductDto): Promise<CreateProductFullResponseDto> {
    // 1. Crear el producto
    const product = await this.plantaRepository.createProduct({
      codProduccion: dto.codProduccion,
      nombProducto: dto.nombProducto,
      numProducto: dto.numProducto,
    });

    const productoResponse: ProductResponseDto = {
      codProduccion: product.codProduccion,
      nombProducto: product.nombProducto,
      numProducto: product.numProducto,
    };

    // 2. Crear registros de kilos por cada destino (solo si isKg=true y se enviaron destinos)
    const kilosResponse: ProductKilosResponseDto[] = [];

    if (dto.isKg === true && dto.destinos && dto.destinos.length > 0) {
      for (const destinoRel of dto.destinos) {
        const kilos = await this.plantaRepository.createProductKilos({
          codProducto: dto.codProduccion,
          destinoRel,
        });
        kilosResponse.push({
          codProducto: kilos.codProducto,
          destinoRel: kilos.destinoRel,
        });
      }
    }

    return { producto: productoResponse, kilos: kilosResponse };
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
