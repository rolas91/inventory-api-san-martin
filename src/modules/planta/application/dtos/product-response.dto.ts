import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 'PROD001', description: 'Código de producción' })
  codProduccion: string;

  @ApiProperty({ example: 'Lomo de Cerdo', description: 'Nombre del producto' })
  nombProducto: string;

  @ApiProperty({ example: '12345', description: 'Número de producto' })
  numProducto: string;
}

export class ProductKilosResponseDto {
  @ApiProperty({ example: 'PROD001', description: 'Código del producto' })
  codProducto: string;

  @ApiProperty({ example: 'DEST_NIC', description: 'Destino relacionado' })
  destinoRel: string;
}
