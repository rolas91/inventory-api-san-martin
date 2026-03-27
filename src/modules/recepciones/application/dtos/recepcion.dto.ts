import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray, IsDateString, IsIn, IsInt, IsNotEmpty,
  IsNumber, IsOptional, IsPositive, IsString, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecepcionDto {
  @ApiProperty({ example: 'Proveedor XYZ' })
  @IsString() @IsNotEmpty() @MaxLength(150)
  proveedor: string;

  @ApiPropertyOptional({ example: 1, nullable: true })
  @IsInt() @IsPositive() @IsOptional()
  bodegaId?: number | null;

  @ApiPropertyOptional({ example: 'OC-2026-001' })
  @IsString() @IsOptional() @MaxLength(50)
  ordenCompra?: string;

  @ApiProperty({ example: '2026-05-27' })
  @IsDateString()
  fecha: string;

  @ApiPropertyOptional({ example: 'Llega en la mañana' })
  @IsString() @IsOptional()
  observaciones?: string;

  @ApiProperty({ example: 'USR001' })
  @IsString() @IsNotEmpty() @MaxLength(50)
  responsable: string;
}

const ESTADOS = ['borrador', 'recibido', 'aprobado'] as const;
const TRANSICIONES: Record<string, string[]> = {
  borrador: ['recibido'],
  recibido: ['aprobado'],
  aprobado: [],
};

export { ESTADOS, TRANSICIONES };

export class UpdateRecepcionEstadoDto {
  @ApiProperty({ enum: ['borrador', 'recibido', 'aprobado'] })
  @IsIn(['borrador', 'recibido', 'aprobado'])
  estado: string;
}

export class RecepcionDetalleItemDto {
  @ApiProperty({ example: '12345' })
  @IsString() @IsNotEmpty() @MaxLength(50)
  codProducto: string;

  @ApiProperty({ example: 'LOMO DE RES' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  nombProducto: string;

  @ApiProperty({ example: 10 })
  @IsInt() @IsPositive()
  cantidadRecibida: number;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  pesoKilos: number;

  @ApiProperty({ example: 330.7 })
  @IsNumber()
  pesoLibras: number;

  @ApiProperty({ example: '2026-05-27' })
  @IsDateString()
  fechaScan: string;
}

export class BatchRecepcionDetalleDto {
  @ApiProperty({ type: [RecepcionDetalleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecepcionDetalleItemDto)
  items: RecepcionDetalleItemDto[];
}
