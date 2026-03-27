import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvPeriodoEntity } from '../../domain/entities/inv-periodo.entity';
import { InvConteoEntity } from '../../domain/entities/inv-conteo.entity';
import { InvConteoDetalleEntity } from '../../domain/entities/inv-conteo-detalle.entity';
import type { CreateInvPeriodoDto } from '../../application/dtos/inv-periodo.dto';
import type { CreateInvConteoDto, InvConteoDetalleItemDto } from '../../application/dtos/inv-conteo.dto';

@Injectable()
export class InvPeriodosRepository {
  constructor(
    @InjectRepository(InvPeriodoEntity)
    private readonly periodoRepo: Repository<InvPeriodoEntity>,
    @InjectRepository(InvConteoEntity)
    private readonly conteoRepo: Repository<InvConteoEntity>,
    @InjectRepository(InvConteoDetalleEntity)
    private readonly detalleRepo: Repository<InvConteoDetalleEntity>,
  ) {}

  // ── Períodos ──────────────────────────────────────────────────────────────
  findAllPeriodos(): Promise<InvPeriodoEntity[]> {
    return this.periodoRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findPeriodoById(id: number): Promise<InvPeriodoEntity> {
    const p = await this.periodoRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Período #${id} no encontrado`);
    return p;
  }

  createPeriodo(dto: CreateInvPeriodoDto): Promise<InvPeriodoEntity> {
    return this.periodoRepo.save(
      this.periodoRepo.create({
        nombre: dto.nombre,
        tipo: dto.tipo,
        bodegaId: dto.bodegaId ?? null,
        fechaInicio: dto.fechaInicio,
        fechaFin: null,
        estado: 'abierto',
        responsable: dto.responsable,
      }),
    );
  }

  async updatePeriodoEstado(id: number, estado: string): Promise<InvPeriodoEntity> {
    const p = await this.findPeriodoById(id);
    p.estado = estado;
    if (estado === 'cerrado' || estado === 'aprobado') {
      p.fechaFin = new Date().toISOString().split('T')[0];
    }
    return this.periodoRepo.save(p);
  }

  // ── Conteos ───────────────────────────────────────────────────────────────
  async findConteosByPeriodo(periodoId: number): Promise<object[]> {
    const conteos = await this.conteoRepo.find({
      where: { periodoId },
      order: { numeroConteo: 'ASC' },
    });

    // Totales agregados por conteo
    return Promise.all(
      conteos.map(async (c) => {
        const totales = await this.detalleRepo
          .createQueryBuilder('d')
          .select('COALESCE(SUM(d.bultos), 0)', 'totalBultos')
          .addSelect('COALESCE(SUM(d.pesoKilos), 0)', 'totalKilos')
          .where('d.conteoId = :id', { id: c.id })
          .getRawOne();
        return {
          id: c.id,
          periodoId: c.periodoId,
          numeroConteo: c.numeroConteo,
          responsable: c.responsable,
          estado: c.estado,
          fecha: c.fecha,
          totalBultos: Number(totales?.totalBultos ?? 0),
          totalKilos: Number(totales?.totalKilos ?? 0),
        };
      }),
    );
  }

  async findConteoById(id: number): Promise<InvConteoEntity> {
    const c = await this.conteoRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException(`Conteo #${id} no encontrado`);
    return c;
  }

  async createConteo(periodoId: number, dto: CreateInvConteoDto): Promise<InvConteoEntity> {
    const periodo = await this.findPeriodoById(periodoId);
    if (periodo.estado !== 'abierto') {
      throw new BadRequestException(
        `El período está en estado '${periodo.estado}' y no admite nuevos conteos`,
      );
    }
    const maxResult = await this.conteoRepo
      .createQueryBuilder('c')
      .select('COALESCE(MAX(c.numeroConteo), 0)', 'max')
      .where('c.periodoId = :periodoId', { periodoId })
      .getRawOne();

    const numeroConteo = Number(maxResult?.max ?? 0) + 1;

    return this.conteoRepo.save(
      this.conteoRepo.create({
        periodoId,
        numeroConteo,
        responsable: dto.responsable,
        estado: 'en_progreso',
        fecha: dto.fecha,
      }),
    );
  }

  async updateConteoEstado(id: number, estado: string): Promise<InvConteoEntity> {
    const c = await this.findConteoById(id);
    c.estado = estado;
    return this.conteoRepo.save(c);
  }

  // ── Detalle ───────────────────────────────────────────────────────────────
  findDetalleByConteo(conteoId: number): Promise<InvConteoDetalleEntity[]> {
    return this.detalleRepo.find({
      where: { conteoId },
      order: { id: 'ASC' },
    });
  }

  async batchInsertDetalle(
    conteoId: number,
    items: InvConteoDetalleItemDto[],
  ): Promise<{ inserted: number }> {
    const conteo = await this.findConteoById(conteoId);
    if (conteo.estado !== 'en_progreso') {
      throw new BadRequestException(
        `El conteo está en estado '${conteo.estado}' y no admite más detalle`,
      );
    }
    const entities = items.map((item) =>
      this.detalleRepo.create({ ...item, conteoId, ubicacionId: item.ubicacionId ?? null }),
    );
    await this.detalleRepo.save(entities);
    return { inserted: entities.length };
  }
}
