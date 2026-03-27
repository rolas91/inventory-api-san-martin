import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'PROD001' })
  @IsString()
  @MinLength(1)
  codProduccion: string;

  @ApiProperty({ example: 'Lomo de Cerdo' })
  @IsString()
  @MinLength(1)
  nombProducto: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @MinLength(1)
  numProducto: string;
}

export class CreateProductKilosDto {
  @ApiProperty({ example: 'PROD001' })
  @IsString()
  @MinLength(1)
  codProducto: string;

  @ApiProperty({ example: 'DEST_NIC' })
  @IsString()
  @MinLength(1)
  destinoRel: string;
}
