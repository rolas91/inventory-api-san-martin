import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBodegaDto {
  @ApiProperty({ example: 'B01' })
  @IsString() @IsNotEmpty() @MaxLength(20)
  codigo: string;

  @ApiProperty({ example: 'Bodega Principal' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({ example: 'Planta A' })
  @IsString() @IsOptional() @MaxLength(255)
  descripcion?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean() @IsOptional()
  activo?: boolean;
}

export class UpdateBodegaDto extends PartialType(CreateBodegaDto) {}

export class BodegaResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() codigo: string;
  @ApiProperty() nombre: string;
  @ApiPropertyOptional() descripcion: string | null;
  @ApiProperty() activo: boolean;
}
