import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { InvFisicoEntity } from '../../domain/entities/inv-fisico.entity';
import { InvFisicoDetailEntity } from '../../domain/entities/inv-fisico-detail.entity';
import { IInvFisicoRepository } from '../../domain/interfaces/inv-fisico-repository.interface';
import type {
  InvFisicoEncabezadoListItemDto,
  InvFisicoLineaPlanaDto,
} from '../../application/dtos/inv-fisico-list.dto';

@Injectable()
export class InvFisicoRepository implements IInvFisicoRepository {
  constructor(
    @InjectRepository(InvFisicoEntity)
    private readonly invFisicoRepo: Repository<InvFisicoEntity>,
    @InjectRepository(InvFisicoDetailEntity)
    private readonly detailRepo: Repository<InvFisicoDetailEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async batchInsert(items: DeepPartial<InvFisicoEntity>[]): Promise<InvFisicoEntity[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entities = items.map((item) => this.invFisicoRepo.create(item));
      const saved = await queryRunner.manager.save(InvFisicoEntity, entities);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAll(): Promise<void> {
    await this.invFisicoRepo.delete({});
  }

  findAll(): Promise<InvFisicoEntity[]> {
    return this.invFisicoRepo.find({
      relations: ['details'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllHeaders(fecha?: string): Promise<InvFisicoEncabezadoListItemDto[]> {
    const qb = this.invFisicoRepo.createQueryBuilder('h');
    if (fecha) {
      qb.andWhere("LEFT(REPLACE(TRIM(h.fecha), '/', '-'), 10) = :fecha", { fecha });
    }
    qb.orderBy('h.createdAt', 'DESC');
    const headers = await qb.getMany();
    const out: InvFisicoEncabezadoListItemDto[] = [];
    for (const h of headers) {
      const detalleCount = await this.detailRepo.count({ where: { invFisicoId: h.id } });
      out.push({
        id: h.id,
        consecutivo: h.consecutivo ?? null,
        fecha: h.fecha,
        codProducto: h.codProducto,
        nombProducto: h.nombProducto,
        pesoKilos: Number(h.pesoKilos),
        pesoLibras: Number(h.pesoLibras),
        bultos: h.bultos,
        codUser: h.codUser,
        consecutivoCaja: h.consecutivoCaja,
        createdAt: h.createdAt.toISOString(),
        detalleCount,
      });
    }
    return out;
  }

  async findFlattenedLineas(invFisicoId?: number, fecha?: string): Promise<InvFisicoLineaPlanaDto[]> {
    const qb = this.invFisicoRepo
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.details', 'd')
      .orderBy('h.createdAt', 'DESC')
      .addOrderBy('d.id', 'ASC');
    if (invFisicoId != null) {
      qb.andWhere('h.id = :id', { id: invFisicoId });
    }
    if (fecha) {
      qb.andWhere("LEFT(REPLACE(TRIM(h.fecha), '/', '-'), 10) = :fecha", { fecha });
    }
    const headers = await qb.getMany();
    const rows: InvFisicoLineaPlanaDto[] = [];
    for (const h of headers) {
      const base = {
        invFisicoId: h.id,
        consecutivo: h.consecutivo ?? null,
        fecha: h.fecha,
        headerCodProducto: h.codProducto,
        headerNombProducto: h.nombProducto,
        headerPesoKilos: Number(h.pesoKilos),
        headerPesoLibras: Number(h.pesoLibras),
        headerBultos: h.bultos,
        codUser: h.codUser,
        headerConsecutivoCaja: h.consecutivoCaja,
        headerCreatedAt: h.createdAt.toISOString(),
      };
      const details = h.details ?? [];
      if (details.length === 0) {
        rows.push({
          ...base,
          detalleId: null,
          numeroProducto: null,
          codProducto: null,
          nombProducto: null,
          fechaDeshuese: null,
          peso: null,
          unidadMedida: null,
          consecutivoCaja: null,
          numMaquinas: null,
          lote: null,
          subLote: null,
          codDestino: null,
          cantPiezas: null,
          secuencia: null,
          detalleCreatedAt: null,
        });
      } else {
        for (const d of details) {
          rows.push({
            ...base,
            detalleId: d.id,
            numeroProducto: d.numeroProducto ?? null,
            codProducto: d.codProducto ?? null,
            nombProducto: d.nombProducto ?? null,
            fechaDeshuese: d.fechaDeshuese ?? null,
            peso: d.peso != null ? Number(d.peso) : null,
            unidadMedida: d.unidadMedida ?? null,
            consecutivoCaja: d.consecutivoCaja ?? null,
            numMaquinas: d.numMaquinas ?? null,
            lote: d.lote ?? null,
            subLote: d.subLote ?? null,
            codDestino: d.codDestino ?? null,
            cantPiezas: d.cantPiezas ?? null,
            secuencia: d.secuencia ?? null,
            detalleCreatedAt: d.createdAt.toISOString(),
          });
        }
      }
    }
    return rows;
  }
}
