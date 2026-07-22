import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScanEventEntity } from './domain/entities/scan-event.entity';
import { ScanSessionEntity } from './domain/entities/scan-session.entity';
import { ScanEventsController } from './infrastructure/controllers/scan-events.controller';
import { ScanEventsRepository } from './infrastructure/repositories/scan-events.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ScanSessionEntity, ScanEventEntity])],
  controllers: [ScanEventsController],
  providers: [ScanEventsRepository],
  exports: [ScanEventsRepository],
})
export class ScanEventsModule {}
