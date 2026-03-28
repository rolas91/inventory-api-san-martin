import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray, IsDateString, IsInt, IsNotEmpty,
  IsNumber, IsOptional, IsString, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SincRecepcionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  idLocal: number;

  @ApiPropertyOptional({ example: 'REC-20260527-001', description: 'Si se omite o ya existe, el backend lo resuelve' })
  @IsString() @IsOptional()
  numero?: string;

  @ApiProperty({ example: 'Proveedor XYZ' })
  @IsString() @IsNotEmpty() @MaxLength(150)
  proveedor: string;

  @ApiPropertyOptional({ nullable: true })
  @IsInt() @IsOptional()
  bodegaId?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsString() @IsOptional() @MaxLength(50)
  ordenCompra?: string | null;

  @ApiProperty({ example: '2026-05-27' })
  @IsDateString()
  fecha: string;

  @ApiProperty({ example: 'recibido', description: 'La app envía recibido al confirmar' })
  @IsString() @IsNotEmpty()
  estado: string;

  @ApiPropertyOptional({ nullable: true })
  @IsString() @IsOptional()
  observaciones?: string | null;

  @ApiProperty({ example: 'USR001' })
  @IsString() @IsNotEmpty() @MaxLength(50)
  responsable: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  createdAt?: string;
}

export class SincDetalleRecepcionItemDto {
  @ApiProperty({ example: 'CCI124' })
  @IsString() @IsNotEmpty() @MaxLength(50)
  codProducto: string;

  @ApiProperty({ example: 'COSTILLA CERDO INDIVIDUAL' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  nombProducto: string;

  @ApiProperty({ example: 10 })
  @IsInt()
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

  @ApiPropertyOptional({ example: '2001,2002' })
  @IsString() @IsOptional()
  consecutivosCaja?: string;
}

export class SincronizarCompletaDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => SincRecepcionDto)
  recepcion: SincRecepcionDto;

  @ApiProperty({ type: [SincDetalleRecepcionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SincDetalleRecepcionItemDto)
  detalles: SincDetalleRecepcionItemDto[];
}

export interface SincronizarCompletaResult {
  recepcionId: number;
  numero: string;
  detallesInsertados: number;
  message: string;
}
