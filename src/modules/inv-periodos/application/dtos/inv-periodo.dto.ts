import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString, IsIn, IsInt, IsNotEmpty,
  IsOptional, IsPositive, IsString, MaxLength,
} from 'class-validator';

export class CreateInvPeriodoDto {
  @ApiProperty({ example: 'Ciclo Mayo 2026' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  nombre: string;

  @ApiProperty({ enum: ['completo', 'ciclico', 'spot'], default: 'completo' })
  @IsIn(['completo', 'ciclico', 'spot'])
  tipo: string;

  @ApiPropertyOptional({ example: 1, nullable: true })
  @IsInt() @IsPositive() @IsOptional()
  bodegaId?: number | null;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: 'USR001' })
  @IsString() @IsNotEmpty() @MaxLength(50)
  responsable: string;
}

export class UpdatePeriodoEstadoDto {
  @ApiProperty({ enum: ['abierto', 'cerrado', 'aprobado'] })
  @IsIn(['abierto', 'cerrado', 'aprobado'])
  estado: string;
}
