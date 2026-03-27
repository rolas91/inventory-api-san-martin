import { Injectable } from '@nestjs/common';
import { InvFisicoRepository } from '../../infrastructure/repositories/inv-fisico.repository';
import { InvFisicoItemDto } from '../dtos/inv-fisico-batch.dto';
import { InvFisicoEntity } from '../../domain/entities/inv-fisico.entity';

@Injectable()
export class BatchInvFisicoUseCase {
  constructor(private readonly invFisicoRepository: InvFisicoRepository) {}

  async execute(items: InvFisicoItemDto[]): Promise<{ success: boolean; count: number }> {
    const entities: Partial<InvFisicoEntity>[] = items.map((item) => ({
      consecutivo: item.consecutivo,
      fecha: item.fecha,
      codProducto: item.codProducto,
      nombProducto: item.nomb_Producto,
      pesoKilos: item.peso_kilos,
      pesoLibras: item.peso_libras,
      bultos: item.bultos,
      codUser: item.cod_user,
    }));

    const saved = await this.invFisicoRepository.batchInsert(entities);
    return { success: true, count: saved.length };
  }
}
