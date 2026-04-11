import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Fila de listado de encabezados (inventario físico — cabeceras). */
export class InvFisicoEncabezadoListItemDto {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional()
  consecutivo: number | null;

  @ApiProperty()
  fecha: string;

  @ApiProperty()
  codProducto: string;

  @ApiProperty()
  nombProducto: string;

  @ApiProperty()
  pesoKilos: number;

  @ApiProperty()
  pesoLibras: number;

  @ApiProperty()
  bultos: number;

  @ApiProperty()
  codUser: string;

  @ApiProperty()
  consecutivoCaja: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ description: 'Cantidad de líneas de detalle (barcode) asociadas' })
  detalleCount: number;
}

/**
 * Línea plana: cabecera + detalle (una fila por cada detalle;
 * si no hay detalles, una fila solo con cabecera).
 */
export class InvFisicoLineaPlanaDto {
  @ApiProperty()
  invFisicoId: number;

  @ApiPropertyOptional()
  consecutivo: number | null;

  @ApiProperty()
  fecha: string;

  @ApiProperty()
  headerCodProducto: string;

  @ApiProperty()
  headerNombProducto: string;

  @ApiProperty()
  headerPesoKilos: number;

  @ApiProperty()
  headerPesoLibras: number;

  @ApiProperty()
  headerBultos: number;

  @ApiProperty()
  codUser: string;

  @ApiProperty()
  headerConsecutivoCaja: string;

  @ApiProperty()
  headerCreatedAt: string;

  @ApiPropertyOptional()
  detalleId: number | null;

  @ApiPropertyOptional()
  numeroProducto: number | null;

  @ApiPropertyOptional()
  codProducto: string | null;

  @ApiPropertyOptional()
  nombProducto: string | null;

  @ApiPropertyOptional()
  fechaDeshuese: string | null;

  @ApiPropertyOptional()
  peso: number | null;

  @ApiPropertyOptional()
  unidadMedida: string | null;

  @ApiPropertyOptional()
  consecutivoCaja: string | null;

  @ApiPropertyOptional()
  numMaquinas: string | null;

  @ApiPropertyOptional()
  lote: string | null;

  @ApiPropertyOptional()
  subLote: string | null;

  @ApiPropertyOptional()
  codDestino: string | null;

  @ApiPropertyOptional()
  cantPiezas: number | null;

  @ApiPropertyOptional()
  secuencia: number | null;

  @ApiPropertyOptional()
  detalleCreatedAt: string | null;
}
