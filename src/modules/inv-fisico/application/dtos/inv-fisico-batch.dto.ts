import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/** Detalle decodificado del código de barras — mapeado a inv_fisico_details */
export class InvFisicoDetailItemDto {
  @ApiPropertyOptional({ example: 124, description: 'Número de producto del barcode' })
  @IsInt() @IsOptional()
  numeroProducto?: number;

  @ApiPropertyOptional({ example: 'CCI124' })
  @IsString() @IsOptional()
  codProducto?: string;

  @ApiPropertyOptional({ example: 'COSTILLA CERDO INDIVIDUAL' })
  @IsString() @IsOptional()
  nombProducto?: string;

  @ApiPropertyOptional({ example: '2026-04-10', description: 'Fecha de deshuese del barcode' })
  @IsString() @IsOptional()
  fechaDeshuese?: string;

  @ApiPropertyOptional({ example: 120.5 })
  @IsNumber() @IsOptional()
  peso?: number;

  @ApiPropertyOptional({ example: 'KG', description: 'KG o LB' })
  @IsString() @IsOptional()
  unidadMedida?: string;

  @ApiPropertyOptional({ example: '1001' })
  @IsString() @IsOptional()
  consecutivoCaja?: string;

  @ApiPropertyOptional({ example: '01' })
  @IsString() @IsOptional()
  numMaquinas?: string;

  @ApiPropertyOptional({ example: 'L01' })
  @IsString() @IsOptional()
  lote?: string;

  @ApiPropertyOptional({ example: 'SL01' })
  @IsString() @IsOptional()
  subLote?: string;

  @ApiPropertyOptional({ example: '00' })
  @IsString() @IsOptional()
  codDestino?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsInt() @IsOptional()
  cantPiezas?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt() @IsOptional()
  secuencia?: number;
}

/** Línea de inventario rápido — mapeada a inv_fisico */
export class InvFisicoItemDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsNumber()
  consecutivo?: number;

  @ApiProperty({ example: '2026-05-15' })
  @IsString()
  fecha: string;

  @ApiProperty({ example: 'CCI124' })
  @IsString()
  codProducto: string;

  @ApiProperty({ example: 'COSTILLA CERDO INDIVIDUAL' })
  @IsString()
  nomb_Producto: string;

  @ApiProperty({ example: 120.5 })
  @IsNumber()
  peso_kilos: number;

  @ApiProperty({ example: 265.7 })
  @IsNumber()
  peso_libras: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  bultos: number;

  @ApiProperty({ example: 'USR001' })
  @IsString()
  cod_user: string;

  @ApiPropertyOptional({
    description: 'Detalle decodificado del código de barras (campos del barcode)',
    type: [InvFisicoDetailItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvFisicoDetailItemDto)
  @IsOptional()
  details?: InvFisicoDetailItemDto[];
}

/** @deprecated — se mantiene por compatibilidad con ParseArrayPipe en el controlador */
export class InvFisicoBatchDto {
  @ApiProperty({ type: [InvFisicoItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvFisicoItemDto)
  items: InvFisicoItemDto[];
}
