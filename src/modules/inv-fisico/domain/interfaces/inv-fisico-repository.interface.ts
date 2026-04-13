import { DeepPartial } from 'typeorm';
import { InvFisicoEntity } from '../entities/inv-fisico.entity';
import type { InvFisicoEncabezadoListItemDto, InvFisicoLineaPlanaDto } from '../../application/dtos/inv-fisico-list.dto';

export interface IInvFisicoRepository {
  batchInsert(items: DeepPartial<InvFisicoEntity>[]): Promise<InvFisicoEntity[]>;
  deleteAll(): Promise<void>;
  findAll(): Promise<InvFisicoEntity[]>;
  findAllHeaders(fecha?: string): Promise<InvFisicoEncabezadoListItemDto[]>;
  findFlattenedLineas(invFisicoId?: number, fecha?: string): Promise<InvFisicoLineaPlanaDto[]>;
}

export const INV_FISICO_REPOSITORY = 'INV_FISICO_REPOSITORY';
