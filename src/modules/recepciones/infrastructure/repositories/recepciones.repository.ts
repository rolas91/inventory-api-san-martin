import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecepcionEntity } from '../../domain/entities/recepcion.entity';
import { RecepcionDetalleEntity } from '../../domain/entities/recepcion-detalle.entity';
import type { CreateRecepcionDto, RecepcionDetalleItemDto } from '../../application/dtos/recepcion.dto';
import { TRANSICIONES } from '../../application/dtos/recepcion.dto';

@Injectable()
export class RecepcionesRepository {
  constructor(
    @InjectRepository(RecepcionEntity)
    private readonly recepcionRepo: Repository<RecepcionEntity>,
    @InjectRepository(RecepcionDetalleEntity)
    private readonly detalleRepo: Repository<RecepcionDetalleEntity>,
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
}
