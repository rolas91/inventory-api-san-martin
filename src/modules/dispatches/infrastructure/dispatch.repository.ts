import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { JwtPayload } from '../../auth/domain/interfaces/jwt-payload.interface';
import { CreateDispatchDto } from '../application/dispatch.dto';
import { DispatchEntity } from '../domain/entities/dispatch.entity';

@Injectable()
export class DispatchRepository {
  constructor(@InjectRepository(DispatchEntity) private readonly repo: Repository<DispatchEntity>) {}
  findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
  async findOne(id: number) { const row = await this.repo.findOne({ where: { id } }); if (!row) throw new NotFoundException(`Despacho #${id} no encontrado`); return row; }
  async create(dto: CreateDispatchDto, user: JwtPayload) {
    const prefix = `DESP-${dto.fecha.replace(/-/g, '')}-`;
    const last = await this.repo.createQueryBuilder('d').where('d.numero LIKE :p', { p: `${prefix}%` }).orderBy('d.numero', 'DESC').getOne();
    const next = last ? Number(last.numero.split('-').pop()) + 1 : 1;
    return this.repo.save(this.repo.create({ ...dto, warehouseId: dto.warehouseId ?? null, referenceDocument: dto.referenceDocument ?? null, observaciones: dto.observaciones ?? null, numero: `${prefix}${String(next).padStart(3, '0')}`, estado: 'draft', responsable: user.codigoUser }));
  }
  async updateStatus(id: number, estado: string) {
    const row = await this.findOne(id);
    if (row.estado !== 'draft') throw new BadRequestException(`El despacho está en estado '${row.estado}'`);
    row.estado = estado;
    return this.repo.save(row);
  }
  async markCancelled(id: number) { const row = await this.findOne(id); row.estado = 'cancelled'; return this.repo.save(row); }
}
