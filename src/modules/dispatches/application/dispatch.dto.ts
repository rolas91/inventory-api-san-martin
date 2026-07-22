import { IsDateString, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
export class CreateDispatchDto {
  @IsString() destino: string;
  @IsOptional() @IsInt() warehouseId?: number | null;
  @IsString() referenceDocument: string;
  @IsDateString() fecha: string;
  @IsOptional() @IsString() observaciones?: string | null;
}
export class UpdateDispatchStatusDto {
  @IsIn(['dispatched', 'cancelled']) estado: string;
}
