import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodegaEntity } from './domain/entities/bodega.entity';
import { UbicacionEntity } from './domain/entities/ubicacion.entity';
import { BodegasRepository } from './infrastructure/repositories/bodegas.repository';
import { BodegasController } from './infrastructure/controllers/bodegas.controller';
import { UbicacionesController } from './infrastructure/controllers/ubicaciones.controller';
import { CatalogosController } from './infrastructure/controllers/catalogos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BodegaEntity, UbicacionEntity])],
  controllers: [CatalogosController, BodegasController, UbicacionesController],
  providers: [BodegasRepository],
  exports: [BodegasRepository],
})
export class BodegasModule {}
