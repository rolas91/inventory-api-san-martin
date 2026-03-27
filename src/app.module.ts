import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { dataSourceOptions } from './database/data-source';
import { AuthModule } from './modules/auth/auth.module';
import { PlantaModule } from './modules/planta/planta.module';
import { InvFisicoModule } from './modules/inv-fisico/inv-fisico.module';
import { BodegasModule } from './modules/bodegas/bodegas.module';
import { InvPeriodosModule } from './modules/inv-periodos/inv-periodos.module';
import { RecepcionesModule } from './modules/recepciones/recepciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
    }),
    AuthModule,
    PlantaModule,
    InvFisicoModule,
    BodegasModule,
    InvPeriodosModule,
    RecepcionesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
