import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BodegaEntity } from '../../domain/entities/bodega.entity';
import { UbicacionEntity } from '../../domain/entities/ubicacion.entity';
import type { CreateBodegaDto, UpdateBodegaDto } from '../../application/dtos/bodega.dto';
import type { CreateUbicacionDto, UpdateUbicacionDto } from '../../application/dtos/ubicacion.dto';

@Injectable()
export class BodegasRepository {
  constructor(
    @InjectRepository(BodegaEntity)
    private readonly bodegaRepo: Repository<BodegaEntity>,
    @InjectRepository(UbicacionEntity)
    private readonly ubicacionRepo: Repository<UbicacionEntity>,
  ) {}

  // ── Bodegas ──────────────────────────────────────────────────────────────
  findAllBodegas(soloActivas = false): Promise<BodegaEntity[]> {
    return this.bodegaRepo.find({
      where: soloActivas ? { activo: true } : undefined,
      order: { nombre: 'ASC' },
    });
  }

  async findBodegaById(id: number): Promise<BodegaEntity> {
    const b = await this.bodegaRepo.findOne({ where: { id } });
    if (!b) throw new NotFoundException(`Bodega #${id} no encontrada`);
    return b;
  }

  createBodega(dto: CreateBodegaDto): Promise<BodegaEntity> {
    return this.bodegaRepo.save(
      this.bodegaRepo.create({ ...dto, activo: dto.activo ?? true }),
    );
  }

  async updateBodega(id: number, dto: UpdateBodegaDto): Promise<BodegaEntity> {
    const b = await this.findBodegaById(id);
    Object.assign(b, dto);
    return this.bodegaRepo.save(b);
  }

  async softDeleteBodega(id: number): Promise<void> {
    const b = await this.findBodegaById(id);
    b.activo = false;
    await this.bodegaRepo.save(b);
  }

  // ── Ubicaciones ───────────────────────────────────────────────────────────
  findUbicacionesByBodega(bodegaId: number, soloActivas = false): Promise<UbicacionEntity[]> {
    return this.ubicacionRepo.find({
      where: soloActivas
        ? { bodegaId, activo: true }
        : { bodegaId },
      order: { nombre: 'ASC' },
    });
  }

  findAllUbicaciones(soloActivas = false): Promise<UbicacionEntity[]> {
    return this.ubicacionRepo.find({
      where: soloActivas ? { activo: true } : undefined,
      order: { nombre: 'ASC' },
    });
  }

  async findUbicacionById(id: number): Promise<UbicacionEntity> {
    const u = await this.ubicacionRepo.findOne({ where: { id } });
    if (!u) throw new NotFoundException(`Ubicación #${id} no encontrada`);
    return u;
  }

  createUbicacion(dto: CreateUbicacionDto): Promise<UbicacionEntity> {
    return this.ubicacionRepo.save(
      this.ubicacionRepo.create({ ...dto, activo: dto.activo ?? true }),
    );
  }

  async updateUbicacion(id: number, dto: UpdateUbicacionDto): Promise<UbicacionEntity> {
    const u = await this.findUbicacionById(id);
    Object.assign(u, dto);
    return this.ubicacionRepo.save(u);
  }

  async softDeleteUbicacion(id: number): Promise<void> {
    const u = await this.findUbicacionById(id);
    u.activo = false;
    await this.ubicacionRepo.save(u);
  }
}
