import { Module } from '@nestjs/common'; import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchEntity } from './domain/entities/dispatch.entity'; import { DispatchController } from './infrastructure/dispatch.controller'; import { DispatchRepository } from './infrastructure/dispatch.repository';
import { ScanEventsModule } from '../scan-events/scan-events.module';
@Module({ imports: [TypeOrmModule.forFeature([DispatchEntity]), ScanEventsModule], controllers: [DispatchController], providers: [DispatchRepository] }) export class DispatchesModule {}
