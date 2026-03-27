import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateUbicacionDto {
  @ApiProperty({ example: 1 })
  @IsInt() @IsPositive()
  bodegaId: number;

  @ApiProperty({ example: 'A-01' })
  @IsString() @IsNotEmpty() @MaxLength(20)
  codigo: string;

  @ApiProperty({ example: 'Pasillo A Estante 1' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean() @IsOptional()
  activo?: boolean;
}

export class UpdateUbicacionDto extends PartialType(OmitType(CreateUbicacionDto, ['bodegaId'])) {}

export class UbicacionResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() bodegaId: number;
  @ApiProperty() codigo: string;
  @ApiProperty() nombre: string;
  @ApiProperty() activo: boolean;
}
