import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecepcionEntity } from './domain/entities/recepcion.entity';
import { RecepcionDetalleEntity } from './domain/entities/recepcion-detalle.entity';
import { RecepcionesRepository } from './infrastructure/repositories/recepciones.repository';
import { RecepcionesController } from './infrastructure/controllers/recepciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RecepcionEntity, RecepcionDetalleEntity])],
  controllers: [RecepcionesController],
  providers: [RecepcionesRepository],
})
export class RecepcionesModule {}
