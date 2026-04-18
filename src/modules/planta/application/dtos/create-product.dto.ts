import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique, IsArray, IsBoolean, IsOptional,
  IsString, MaxLength, MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'CCI124', description: 'Código de producción (único)' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  codProduccion: string;

  @ApiProperty({ example: 'COSTILLA CERDO INDIVIDUAL' })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  nombProducto: string;

  @ApiProperty({ example: '124' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  numProducto: string;

  @ApiPropertyOptional({
    example: true,
    description:
      'Si es true, permite registrar destinos en productos_kilos. Si es false/omitido, no registra kilos aunque se envíe `destinos`.',
  })
  @IsOptional()
  @IsBoolean()
  isKg?: boolean;

  @ApiPropertyOptional({
    example: ['00', 'NI', 'CR'],
    description: 'Destinos para registrar en productos_kilos. Si se omite, no se crea ningún registro de kilos.',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @ArrayUnique()
  @IsOptional()
  destinos?: string[];
}

export class CreateProductKilosDto {
  @ApiProperty({ example: 'CCI124' })
  @IsString()
  @MinLength(1)
  codProducto: string;

  @ApiProperty({ example: '00' })
  @IsString()
  @MinLength(1)
  destinoRel: string;
}
