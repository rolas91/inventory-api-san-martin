import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvFisicoEntity } from './domain/entities/inv-fisico.entity';
import { InvFisicoDetailEntity } from './domain/entities/inv-fisico-detail.entity';
import { InvFisicoRepository } from './infrastructure/repositories/inv-fisico.repository';
import { InvFisicoController } from './infrastructure/controllers/inv-fisico.controller';
import { BatchInvFisicoUseCase } from './application/use-cases/batch-inv-fisico.use-case';
import { DeleteAllInvFisicoUseCase } from './application/use-cases/delete-all-inv-fisico.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([InvFisicoEntity, InvFisicoDetailEntity])],
  controllers: [InvFisicoController],
  providers: [
    InvFisicoRepository,
    BatchInvFisicoUseCase,
    DeleteAllInvFisicoUseCase,
  ],
})
export class InvFisicoModule {}
