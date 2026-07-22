import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import type { JwtPayload } from '../../../auth/domain/interfaces/jwt-payload.interface';
import { ScanEventsBatchDto } from '../../application/dtos/scan-events.dto';
import { ScanEventEntity } from '../../domain/entities/scan-event.entity';
import { ScanSessionEntity } from '../../domain/entities/scan-session.entity';

@Injectable()
export class ScanEventsRepository {
  constructor(
    @InjectRepository(ScanSessionEntity) private readonly sessions: Repository<ScanSessionEntity>,
    @InjectRepository(ScanEventEntity) private readonly events: Repository<ScanEventEntity>,
  ) {}

  async ingest(dto: ScanEventsBatchDto, user: JwtPayload) {
    let session = await this.sessions.findOne({ where: { uuid: dto.session.uuid } });
    if (!session) {
      session = await this.sessions.save(this.sessions.create({
        uuid: dto.session.uuid,
        sessionType: dto.session.sessionType,
        referenceId: dto.session.referenceId ?? null,
        warehouseId: dto.session.warehouseId ?? null,
        status: dto.session.status ?? 'open',
        createdBy: user.codigoUser,
      }));
    } else {
      session.status = dto.session.status ?? session.status;
      session.warehouseId = dto.session.warehouseId ?? session.warehouseId;
      session.referenceId = dto.session.referenceId ?? session.referenceId;
      session = await this.sessions.save(session);
    }

    const existing = dto.events.length
      ? await this.events.find({ where: dto.events.map((event) => ({ uuid: event.uuid })) })
      : [];
    const existingUuids = new Set(existing.map((event) => event.uuid));
    const fresh = dto.events.filter((event) => !existingUuids.has(event.uuid));
    const outgoing = fresh.filter((event) => event.operation === 'OUT');
    const batchBoxes = new Set<string>();
    for (const event of outgoing) {
      const box = event.boxSequence?.trim();
      if (!box) throw new BadRequestException('Todo despacho requiere consecutivo de caja');
      if (!event.referenceDocument?.trim()) throw new BadRequestException(`La caja ${box} requiere documento de despacho`);
      if (batchBoxes.has(box)) throw new BadRequestException(`La caja ${box} está repetida en el despacho`);
      batchBoxes.add(box);
      const alreadyOut = await this.events.exists({ where: { boxSequence: box, operation: 'OUT' } });
      if (alreadyOut) throw new BadRequestException(`La caja ${box} ya fue despachada`);
      const available = await this.events.exists({ where: [{ boxSequence: box, operation: 'COUNT' }, { boxSequence: box, operation: 'IN' }] });
      if (!available) throw new BadRequestException(`La caja ${box} no aparece en conteos o recepciones`);
    }
    if (fresh.length) {
      await this.events.save(fresh.map((event) => this.events.create({
        ...event,
        sessionId: session.id,
        productName: event.productName ?? '',
        boxSequence: event.boxSequence ?? null,
        lot: event.lot ?? null,
        subLot: event.subLot ?? null,
        destinationCode: event.destinationCode ?? null,
        piecesCount: event.piecesCount ?? null,
        sequence: event.sequence ?? null,
        locationId: event.locationId ?? null,
        referenceDocument: event.referenceDocument ?? null,
        performedBy: user.codigoUser,
        occurredAt: new Date(event.occurredAt),
        reversesEventUuid: event.reversesEventUuid ?? null,
        rawBarcode: event.rawBarcode ?? null,
      })));
    }

    return { sessionId: session.id, sessionUuid: session.uuid, inserted: fresh.length, duplicates: existing.length };
  }

  async findSessions(sessionType?: string, referenceId?: number) {
    const qb = this.sessions.createQueryBuilder('s')
      .loadRelationCountAndMap('s.eventCount', 's.events')
      .orderBy('s.updatedAt', 'DESC');
    if (sessionType) qb.andWhere('s.sessionType = :sessionType', { sessionType });
    if (referenceId != null) qb.andWhere('s.referenceId = :referenceId', { referenceId });
    return qb.getMany();
  }

  async findEvents(sessionUuid: string) {
    const session = await this.sessions.findOne({ where: { uuid: sessionUuid } });
    if (!session) throw new NotFoundException(`Sesión ${sessionUuid} no encontrada`);
    return this.events.find({ where: { sessionId: session.id }, order: { occurredAt: 'ASC', id: 'ASC' } });
  }

  async summary(sessionUuid: string) {
    const session = await this.sessions.findOne({ where: { uuid: sessionUuid } });
    if (!session) throw new NotFoundException(`Sesión ${sessionUuid} no encontrada`);
    return this.events.createQueryBuilder('e')
      .select('e.productCode', 'productCode')
      .addSelect('MAX(e.productName)', 'productName')
      .addSelect('SUM(e.quantitySign)', 'netPackages')
      .addSelect("SUM(CASE WHEN e.operation = 'COUNT' THEN 1 ELSE 0 END)", 'countedPackages')
      .addSelect("SUM(CASE WHEN e.operation = 'OUT' THEN 1 ELSE 0 END)", 'outPackages')
      .addSelect('SUM(e.weightKg * e.quantitySign)', 'netWeightKg')
      .addSelect('SUM(e.weightLb * e.quantitySign)', 'netWeightLb')
      .where('e.sessionId = :sessionId', { sessionId: session.id })
      .groupBy('e.productCode')
      .orderBy('MAX(e.productName)', 'ASC')
      .getRawMany();
  }

  async summaryByReference(sessionType: string, referenceId: number) {
    const session = await this.sessions.findOne({ where: { sessionType, referenceId }, order: { updatedAt: 'DESC' } });
    if (!session) return [];
    return this.summary(session.uuid);
  }

  async reverseByReference(sessionType: string, referenceId: number, user: JwtPayload) {
    const session = await this.sessions.findOne({ where: { sessionType, referenceId }, order: { updatedAt: 'DESC' } });
    if (!session) throw new NotFoundException('Sesión de despacho no encontrada');
    const outgoing = await this.events.find({ where: { sessionId: session.id, operation: 'OUT' } });
    let inserted = 0;
    for (const source of outgoing) {
      if (await this.events.exists({ where: { reversesEventUuid: source.uuid } })) continue;
      await this.events.save(this.events.create({ ...source, id: undefined, uuid: randomUUID(), operation: 'REVERSAL', quantitySign: 1, performedBy: user.codigoUser, occurredAt: new Date(), reversesEventUuid: source.uuid, createdAt: undefined }));
      inserted++;
    }
    session.status = 'cancelled'; await this.sessions.save(session);
    return { reversed: inserted };
  }
}
