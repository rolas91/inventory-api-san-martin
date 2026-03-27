import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray, IsDateString, IsIn, IsInt, IsNotEmpty,
  IsNumber, IsOptional, IsPositive, IsString, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvConteoDto {
  @ApiProperty({ example: 'USR001' })
  @IsString() @IsNotEmpty() @MaxLength(50)
  responsable: string;

  @ApiProperty({ example: '2026-05-15' })
  @IsDateString()
  fecha: string;
}

export class UpdateConteoEstadoDto {
  @ApiProperty({ enum: ['en_progreso', 'finalizado'] })
  @IsIn(['en_progreso', 'finalizado'])
  estado: string;
}

export class InvConteoDetalleItemDto {
  @ApiProperty({ example: '12345' })
  @IsString() @IsNotEmpty() @MaxLength(50)
  codProducto: string;

  @ApiProperty({ example: 'LOMO DE RES' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  nombProducto: string;

  @ApiPropertyOptional({ nullable: true })
  @IsInt() @IsPositive() @IsOptional()
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
}

export class BatchInvConteoDetalleDto {
  @ApiProperty({ type: [InvConteoDetalleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvConteoDetalleItemDto)
  items: InvConteoDetalleItemDto[];
}
