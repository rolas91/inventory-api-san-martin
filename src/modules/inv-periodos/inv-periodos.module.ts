import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvPeriodoEntity } from './domain/entities/inv-periodo.entity';
import { InvConteoEntity } from './domain/entities/inv-conteo.entity';
import { InvConteoDetalleEntity } from './domain/entities/inv-conteo-detalle.entity';
import { InvPeriodosRepository } from './infrastructure/repositories/inv-periodos.repository';
import { InvPeriodosController } from './infrastructure/controllers/inv-periodos.controller';
import { InvConteosController } from './infrastructure/controllers/inv-conteos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvPeriodoEntity,
      InvConteoEntity,
      InvConteoDetalleEntity,
    ]),
  ],
  controllers: [InvPeriodosController, InvConteosController],
  providers: [InvPeriodosRepository],
})
export class InvPeriodosModule {}
