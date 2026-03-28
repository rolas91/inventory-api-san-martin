import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 'CCI124' })
  codProduccion: string;

  @ApiProperty({ example: 'COSTILLA CERDO INDIVIDUAL' })
  nombProducto: string;

  @ApiProperty({ example: '124' })
  numProducto: string;
}

export class ProductKilosResponseDto {
  @ApiProperty({ example: 'CCI124' })
  codProducto: string;

  @ApiProperty({ example: '00' })
  destinoRel: string;
}

export class CreateProductFullResponseDto {
  @ApiProperty({ description: 'Producto creado' })
  producto: ProductResponseDto;

  @ApiPropertyOptional({ description: 'Registros de kilos creados por destino', type: [ProductKilosResponseDto] })
  kilos: ProductKilosResponseDto[];
}
