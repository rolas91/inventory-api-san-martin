import { DeepPartial } from 'typeorm';
import { InvFisicoEntity } from '../entities/inv-fisico.entity';

export interface IInvFisicoRepository {
  batchInsert(items: DeepPartial<InvFisicoEntity>[]): Promise<InvFisicoEntity[]>;
  deleteAll(): Promise<void>;
  findAll(): Promise<InvFisicoEntity[]>;
}

export const INV_FISICO_REPOSITORY = 'INV_FISICO_REPOSITORY';
