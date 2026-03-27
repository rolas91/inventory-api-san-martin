import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import AppDataSource from '../data-source';
import { InvFisicoEntity } from '../../modules/inv-fisico/domain/entities/inv-fisico.entity';
import { InvFisicoDetailEntity } from '../../modules/inv-fisico/domain/entities/inv-fisico-detail.entity';

async function resetInvFisico() {
  console.log('🧹 Limpiando tablas de inventario físico...');

  await AppDataSource.initialize();

  await AppDataSource.getRepository(InvFisicoDetailEntity).delete({});
  console.log('   ✔ inv_fisico_details vaciada');

  await AppDataSource.getRepository(InvFisicoEntity).delete({});
  console.log('   ✔ inv_fisico vaciada');

  await AppDataSource.destroy();
  console.log('✅ Reset de inventario completado');
}

resetInvFisico().catch((err) => {
  console.error(err);
  process.exit(1);
});
