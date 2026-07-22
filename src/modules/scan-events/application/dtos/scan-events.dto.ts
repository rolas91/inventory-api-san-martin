import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class ScanSessionDto {
  @IsUUID() uuid: string;
  @IsIn(['rapid', 'count', 'receipt', 'dispatch']) sessionType: string;
  @IsOptional() @IsInt() referenceId?: number | null;
  @IsOptional() @IsInt() warehouseId?: number | null;
  @IsOptional() @IsString() status?: string;
}

export class ScanEventItemDto {
  @IsUUID() uuid: string;
  @IsIn(['COUNT', 'IN', 'OUT', 'TRANSFER', 'REVERSAL']) operation: string;
  @IsIn([-1, 1]) quantitySign: number;
  @IsString() productCode: string;
  @IsOptional() @IsString() productName?: string;
  @IsOptional() @IsString() boxSequence?: string | null;
  @IsNumber() originalWeight: number;
  @IsString() originalUnit: string;
  @IsNumber() weightKg: number;
  @IsNumber() weightLb: number;
  @IsOptional() @IsString() lot?: string | null;
  @IsOptional() @IsString() subLot?: string | null;
  @IsOptional() @IsString() destinationCode?: string | null;
  @IsOptional() @IsInt() piecesCount?: number | null;
  @IsOptional() @IsInt() sequence?: number | null;
  @IsOptional() @IsInt() locationId?: number | null;
  @IsOptional() @IsString() referenceDocument?: string | null;
  @IsDateString() occurredAt: string;
  @IsOptional() @IsUUID() reversesEventUuid?: string | null;
  @IsOptional() @IsString() rawBarcode?: string | null;
}

export class ScanEventsBatchDto {
  @ValidateNested() @Type(() => ScanSessionDto) session: ScanSessionDto;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ScanEventItemDto) events: ScanEventItemDto[];
}
