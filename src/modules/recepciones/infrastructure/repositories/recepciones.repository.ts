import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RecepcionEntity } from '../../domain/entities/recepcion.entity';
import { RecepcionDetalleEntity } from '../../domain/entities/recepcion-detalle.entity';
import type { CreateRecepcionDto, RecepcionDetalleItemDto } from '../../application/dtos/recepcion.dto';
import { TRANSICIONES } from '../../application/dtos/recepcion.dto';
import type {
  SincronizarCompletaDto,
  SincronizarCompletaResult,
} from '../../application/dtos/sincronizar-completa.dto';

@Injectable()
export class RecepcionesRepository {
  constructor(
    @InjectRepository(RecepcionEntity)
    private readonly recepcionRepo: Repository<RecepcionEntity>,
    @InjectRepository(RecepcionDetalleEntity)
    private readonly detalleRepo: Repository<RecepcionDetalleEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Número correlativo REC-YYYYMMDD-NNN ───────────────────────────────────
  private async generarNumero(fecha: string): Promise<string> {
    const datePart = fecha.replace(/-/g, '');        // "20260527"
    const prefix = `REC-${datePart}-`;

    const last = await this.recepcionRepo
      .createQueryBuilder('r')
      .select('r.numero', 'numero')
      .where('r.numero LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('r.numero', 'DESC')
      .limit(1)
      .getRawOne();

    let correlativo = 1;
    if (last?.numero) {
      const parts = (last.numero as string).split('-');
      correlativo = parseInt(parts[parts.length - 1], 10) + 1;
    }

    return `${prefix}${String(correlativo).padStart(3, '0')}`;
  }

  // ── Recepciones ───────────────────────────────────────────────────────────
  findAll(): Promise<RecepcionEntity[]> {
    return this.recepcionRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<RecepcionEntity> {
    const r = await this.recepcionRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Recepción #${id} no encontrada`);
    return r;
  }

  async create(dto: CreateRecepcionDto): Promise<RecepcionEntity> {
    const numero = await this.generarNumero(dto.fecha);
    return this.recepcionRepo.save(
      this.recepcionRepo.create({
        numero,
        proveedor: dto.proveedor,
        bodegaId: dto.bodegaId ?? null,
        ordenCompra: dto.ordenCompra ?? null,
        fecha: dto.fecha,
        estado: 'borrador',
        observaciones: dto.observaciones ?? null,
        responsable: dto.responsable,
      }),
    );
  }

  async updateEstado(id: number, nuevoEstado: string): Promise<RecepcionEntity> {
    const r = await this.findById(id);
    const permitidos = TRANSICIONES[r.estado] ?? [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new BadRequestException(
        `Transición inválida: ${r.estado} → ${nuevoEstado}. Permitidas: ${permitidos.join(', ') || 'ninguna'}`,
      );
    }
    r.estado = nuevoEstado;
    return this.recepcionRepo.save(r);
  }

  // ── Detalle ───────────────────────────────────────────────────────────────
  findDetalle(recepcionId: number): Promise<RecepcionDetalleEntity[]> {
    return this.detalleRepo.find({
      where: { recepcionId },
      order: { id: 'ASC' },
    });
  }

  async batchInsertDetalle(
    recepcionId: number,
    items: RecepcionDetalleItemDto[],
  ): Promise<{ inserted: number }> {
    const r = await this.findById(recepcionId);
    if (r.estado !== 'borrador') {
      throw new BadRequestException(
        `La recepción está en estado '${r.estado}' y no admite modificaciones`,
      );
    }
    const entities = items.map((item) =>
      this.detalleRepo.create({ ...item, recepcionId }),
    );
    await this.detalleRepo.save(entities);
    return { inserted: entities.length };
  }

  // ── Resumen ───────────────────────────────────────────────────────────────
  async getResumen(recepcionId: number): Promise<object> {
    await this.findById(recepcionId); // valida que exista
    const result = await this.detalleRepo
      .createQueryBuilder('d')
      .select('COUNT(DISTINCT d.codProducto)', 'totalProductos')
      .addSelect('COALESCE(SUM(d.cantidadRecibida), 0)', 'totalBultos')
      .addSelect('COALESCE(SUM(d.pesoKilos), 0)', 'totalKilos')
      .addSelect('COALESCE(SUM(d.pesoLibras), 0)', 'totalLibras')
      .where('d.recepcionId = :recepcionId', { recepcionId })
      .getRawOne();

    return {
      recepcionId,
      totalProductos: Number(result?.totalProductos ?? 0),
      totalBultos: Number(result?.totalBultos ?? 0),
      totalKilos: Number(result?.totalKilos ?? 0),
      totalLibras: Number(result?.totalLibras ?? 0),
    };
  }

  // ── Sincronización completa (app móvil) ───────────────────────────────────
  /**
   * Recibe encabezado + detalles en una sola petición.
   * Idempotencia por `numero` (campo único):
   *  - Si la recepción NO existe → se crea con el número del cliente (o se genera).
   *  - Si YA existe → se actualiza el estado y se reemplazan los detalles
   *    (delete + re-insert dentro de la misma transacción).
   */
  async sincronizarCompleta(dto: SincronizarCompletaDto): Promise<SincronizarCompletaResult> {
    return this.dataSource.transaction(async (em) => {
      const recepcionRepo = em.getRepository(RecepcionEntity);
      const detalleRepo   = em.getRepository(RecepcionDetalleEntity);

      const r = dto.recepcion;

      // ── 1. Buscar recepción existente por numero ───────────────────────
      let recepcion: RecepcionEntity | null = null;
      if (r.numero) {
        recepcion = await recepcionRepo.findOne({ where: { numero: r.numero } });
      }

      if (!recepcion) {
        // Generar número si el cliente no lo envió o no existe
        const numero = r.numero ?? (await this.generarNumero(r.fecha));

        recepcion = await recepcionRepo.save(
          recepcionRepo.create({
            numero,
            proveedor:     r.proveedor,
            bodegaId:      r.bodegaId ?? null,
            ordenCompra:   r.ordenCompra ?? null,
            fecha:         r.fecha,
            estado:        r.estado,
            observaciones: r.observaciones ?? null,
            responsable:   r.responsable,
          }),
        );

        // Insertar detalles (recepción nueva)
        if (dto.detalles.length > 0) {
          const entities = dto.detalles.map((d) =>
            detalleRepo.create({
              recepcionId:      recepcion!.id,
              codProducto:      d.codProducto,
              nombProducto:     d.nombProducto,
              cantidadRecibida: d.cantidadRecibida,
              pesoKilos:        d.pesoKilos,
              pesoLibras:       d.pesoLibras,
              fechaScan:        d.fechaScan.substring(0, 10),
              consecutivosCaja: d.consecutivosCaja ?? '',
            }),
          );
          await detalleRepo.save(entities);
        }
      } else {
        // Recepción existente: actualizar estado si avanzó
        const permitidos = TRANSICIONES[recepcion.estado] ?? [];
        if (r.estado !== recepcion.estado && permitidos.includes(r.estado)) {
          recepcion.estado = r.estado;
          recepcion = await recepcionRepo.save(recepcion);
        }

        // Reemplazar detalles: delete + re-insert (idempotente ante reintento)
        await detalleRepo.delete({ recepcionId: recepcion.id });
        if (dto.detalles.length > 0) {
          const entities = dto.detalles.map((d) =>
            detalleRepo.create({
              recepcionId:      recepcion!.id,
              codProducto:      d.codProducto,
              nombProducto:     d.nombProducto,
              cantidadRecibida: d.cantidadRecibida,
              pesoKilos:        d.pesoKilos,
              pesoLibras:       d.pesoLibras,
              fechaScan:        d.fechaScan.substring(0, 10),
              consecutivosCaja: d.consecutivosCaja ?? '',
            }),
          );
          await detalleRepo.save(entities);
        }
      }

      return {
        recepcionId:       recepcion.id,
        numero:            recepcion.numero,
        detallesInsertados: dto.detalles.length,
        message: `Recepción #${recepcion.numero} sincronizada correctamente.`,
      };
    });
  }
}
