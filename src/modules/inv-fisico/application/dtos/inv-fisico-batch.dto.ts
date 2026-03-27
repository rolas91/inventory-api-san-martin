import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class InvFisicoItemDto {
  @ApiPropertyOptional({ example: 1, description: 'Consecutivo del registro' })
  @IsOptional()
  @IsNumber()
  consecutivo?: number;

  @ApiProperty({ example: '2024-01-15', description: 'Fecha del inventario' })
  @IsString()
  fecha: string;

  @ApiProperty({ example: 'PROD001', description: 'Código del producto' })
  @IsString()
  codProducto: string;

  @ApiProperty({ example: 'Lomo de Cerdo', description: 'Nombre del producto' })
  @IsString()
  nomb_Producto: string;

  @ApiProperty({ example: 150.5, description: 'Peso en kilos' })
  @IsNumber()
  peso_kilos: number;

  @ApiProperty({ example: 331.6, description: 'Peso en libras' })
  @IsNumber()
  peso_libras: number;

  @ApiProperty({ example: 3, description: 'Cantidad de bultos' })
  @IsNumber()
  bultos: number;

  @ApiProperty({ example: 'user01', description: 'Código del usuario que registra' })
  @IsString()
  cod_user: string;
}

export class InvFisicoBatchDto {
  @ApiProperty({ type: [InvFisicoItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvFisicoItemDto)
  items: InvFisicoItemDto[];
}
