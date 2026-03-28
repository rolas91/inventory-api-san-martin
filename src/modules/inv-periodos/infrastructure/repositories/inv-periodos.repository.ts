import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InvPeriodoEntity } from '../../domain/entities/inv-periodo.entity';
import { InvConteoEntity } from '../../domain/entities/inv-conteo.entity';
import { InvConteoDetalleEntity } from '../../domain/entities/inv-conteo-detalle.entity';
import type { CreateInvPeriodoDto } from '../../application/dtos/inv-periodo.dto';
import type { CreateInvConteoDto, InvConteoDetalleItemDto } from '../../application/dtos/inv-conteo.dto';
import type {
  SincronizarCompletoDto,
  SincronizarCompletoResult,
} from '../../application/dtos/sincronizar-completo.dto';

@Injectable()
export class InvPeriodosRepository {
  constructor(
    @InjectRepository(InvPeriodoEntity)
    private readonly periodoRepo: Repository<InvPeriodoEntity>,
    @InjectRepository(InvConteoEntity)
    private readonly conteoRepo: Repository<InvConteoEntity>,
    @InjectRepository(InvConteoDetalleEntity)
    private readonly detalleRepo: Repository<InvConteoDetalleEntity>,
    private readonly dataSource: DataSource,
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

  // ── Sincronización completa (app móvil) ───────────────────────────────────
  /**
   * Recibe período + conteo + detalles en una sola petición.
   * Idempotente: si el par (nombre+fechaInicio+responsable+tipo) ya existe como
   * período, se reutiliza. Si el par (periodoId+numeroConteo) ya existe como
   * conteo, se reutiliza y NO se duplican detalles.
   * Todo ocurre en una sola transacción.
   */
  async sincronizarCompleto(dto: SincronizarCompletoDto): Promise<SincronizarCompletoResult> {
    return this.dataSource.transaction(async (em) => {
      const periodoRepo  = em.getRepository(InvPeriodoEntity);
      const conteoRepo   = em.getRepository(InvConteoEntity);
      const detalleRepo  = em.getRepository(InvConteoDetalleEntity);

      // ── 1. Período: buscar existente o crear ───────────────────────────
      let periodo = await periodoRepo.findOne({
        where: {
          nombre:      dto.periodo.nombre,
          fechaInicio: dto.periodo.fechaInicio,
          responsable: dto.periodo.responsable,
          tipo:        dto.periodo.tipo,
        },
      });

      if (!periodo) {
        periodo = await periodoRepo.save(
          periodoRepo.create({
            nombre:      dto.periodo.nombre,
            tipo:        dto.periodo.tipo,
            bodegaId:    dto.periodo.bodegaId ?? null,
            fechaInicio: dto.periodo.fechaInicio,
            fechaFin:    dto.periodo.fechaFin ?? null,
            estado:      dto.periodo.estado,
            responsable: dto.periodo.responsable,
          }),
        );
      } else {
        // Actualiza estado si avanzó
        if (dto.periodo.estado !== periodo.estado) {
          periodo.estado   = dto.periodo.estado;
          periodo.fechaFin = dto.periodo.fechaFin ?? periodo.fechaFin;
          periodo = await periodoRepo.save(periodo);
        }
      }

      // ── 2. Conteo: buscar existente o crear ────────────────────────────
      let conteo = await conteoRepo.findOne({
        where: { periodoId: periodo.id, numeroConteo: dto.conteo.numeroConteo },
      });

      let detallesInsertados = 0;

      if (!conteo) {
        conteo = await conteoRepo.save(
          conteoRepo.create({
            periodoId:    periodo.id,
            numeroConteo: dto.conteo.numeroConteo,
            responsable:  dto.conteo.responsable,
            estado:       dto.conteo.estado,
            fecha:        dto.conteo.fecha,
          }),
        );

        // ── 3. Detalles (solo si el conteo es nuevo) ──────────────────
        if (dto.detalles.length > 0) {
          const detalleEntities = dto.detalles.map((d) =>
            detalleRepo.create({
              conteoId:         conteo!.id,
              codProducto:      d.codProducto,
              nombProducto:     d.nombProducto,
              ubicacionId:      d.ubicacionId ?? null,
              pesoKilos:        d.pesoKilos,
              pesoLibras:       d.pesoLibras,
              bultos:           d.bultos,
              fechaScan:        d.fechaScan.substring(0, 10),
              consecutivosCaja: d.consecutivosCaja ?? '',
            }),
          );
          await detalleRepo.save(detalleEntities);
          detallesInsertados = detalleEntities.length;
        }
      } else {
        // Conteo existente: actualizar estado si cambió
        if (conteo.estado !== dto.conteo.estado) {
          conteo.estado = dto.conteo.estado;
          await conteoRepo.save(conteo);
        }
        // Detalles: verificar si ya hay registros (evitar duplicados)
        const countExistente = await detalleRepo.count({ where: { conteoId: conteo.id } });
        if (countExistente === 0 && dto.detalles.length > 0) {
          const detalleEntities = dto.detalles.map((d) =>
            detalleRepo.create({
              conteoId:         conteo!.id,
              codProducto:      d.codProducto,
              nombProducto:     d.nombProducto,
              ubicacionId:      d.ubicacionId ?? null,
              pesoKilos:        d.pesoKilos,
              pesoLibras:       d.pesoLibras,
              bultos:           d.bultos,
              fechaScan:        d.fechaScan.substring(0, 10),
              consecutivosCaja: d.consecutivosCaja ?? '',
            }),
          );
          await detalleRepo.save(detalleEntities);
          detallesInsertados = detalleEntities.length;
        }
      }

      return {
        periodoId:          periodo.id,
        conteoId:           conteo.id,
        detallesInsertados,
        message: `Sincronización exitosa. Período #${periodo.id}, Conteo #${conteo.id}.`,
      };
    });
  }
}
