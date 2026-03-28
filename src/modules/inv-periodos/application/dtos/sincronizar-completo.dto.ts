import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray, IsDateString, IsIn, IsInt, IsNotEmpty,
  IsNumber, IsOptional, IsString, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SincPeriodoDto {
  @ApiProperty({ example: 1, description: 'ID local del SQLite del dispositivo' })
  @IsInt()
  idLocal: number;

  @ApiProperty({ example: 'Ciclo Mayo 2026' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  nombre: string;

  @ApiProperty({ enum: ['completo', 'ciclico', 'spot'] })
  @IsIn(['completo', 'ciclico', 'spot'])
  tipo: string;

  @ApiPropertyOptional({ nullable: true })
  @IsInt() @IsOptional()
  bodegaId?: number | null;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  fechaInicio: string;

  @ApiPropertyOptional({ example: '2026-05-31', nullable: true })
  @IsDateString() @IsOptional()
  fechaFin?: string | null;

  @ApiProperty({ enum: ['abierto', 'cerrado', 'aprobado'] })
  @IsIn(['abierto', 'cerrado', 'aprobado'])
  estado: string;

  @ApiProperty({ example: 'USR001' })
  @IsString() @IsNotEmpty() @MaxLength(50)
  responsable: string;

  @ApiPropertyOptional({ example: '2026-05-01T08:00:00.000Z' })
  @IsString() @IsOptional()
  createdAt?: string;
}

export class SincConteoDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  idLocal: number;

  @ApiProperty({ example: 1, description: 'idLocal del período padre' })
  @IsInt()
  periodoIdLocal: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  numeroConteo: number;

  @ApiProperty({ example: 'USR001' })
  @IsString() @IsNotEmpty() @MaxLength(50)
  responsable: string;

  @ApiProperty({ enum: ['en_progreso', 'finalizado'] })
  @IsIn(['en_progreso', 'finalizado'])
  estado: string;

  @ApiProperty({ example: '2026-05-15' })
  @IsDateString()
  fecha: string;

  @ApiPropertyOptional()
  @IsString() @IsOptional()
  createdAt?: string;
}

export class SincDetalleConteoItemDto {
  @ApiProperty({ example: 'CCI124' })
  @IsString() @IsNotEmpty() @MaxLength(50)
  codProducto: string;

  @ApiProperty({ example: 'COSTILLA CERDO INDIVIDUAL' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  nombProducto: string;

  @ApiPropertyOptional({ nullable: true })
  @IsInt() @IsOptional()
  ubicacionId?: number | null;

  @ApiProperty({ example: 120.5 })
  @IsNumber()
  pesoKilos: number;

  @ApiProperty({ example: 265.7 })
  @IsNumber()
  pesoLibras: number;

  @ApiProperty({ example: 8 })
  @IsInt()
  bultos: number;

  @ApiProperty({ example: '2026-05-15' })
  @IsDateString()
  fechaScan: string;

  @ApiPropertyOptional({ example: '1001,1002,1003' })
  @IsString() @IsOptional()
  consecutivosCaja?: string;
}

export class SincronizarCompletoDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => SincPeriodoDto)
  periodo: SincPeriodoDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => SincConteoDto)
  conteo: SincConteoDto;

  @ApiProperty({ type: [SincDetalleConteoItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SincDetalleConteoItemDto)
  detalles: SincDetalleConteoItemDto[];
}

export interface SincronizarCompletoResult {
  periodoId: number;
  conteoId: number;
  detallesInsertados: number;
  message: string;
}
