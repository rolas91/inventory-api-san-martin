import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import AppDataSource from '../data-source';
import { UserEntity } from '../../modules/auth/domain/entities/user.entity';
import { RoleEntity } from '../../modules/auth/domain/entities/role.entity';
import { ProductEntity } from '../../modules/planta/domain/entities/product.entity';
import { ProductKilosEntity } from '../../modules/planta/domain/entities/product-kilos.entity';
import { getUsersSeedData } from './data/users.seed';
import { productsSeedData } from './data/products.seed';
import { productsKilosSeedData } from './data/products-kilos.seed';

async function runSeed() {
  console.log('🌱 Iniciando seed...');

  await AppDataSource.initialize();
  console.log('✅ Conexión a base de datos establecida');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // ── Users ──────────────────────────────────────────────────────────────
    console.log('\n👤 Seeding users...');
    const userRepo = AppDataSource.getRepository(UserEntity);
    const roleRepo = AppDataSource.getRepository(RoleEntity);
    const usersData = await getUsersSeedData();

    for (const data of usersData) {
      const exists = await userRepo.findOne({ where: { codigoUser: data.codigoUser } });
      if (!exists) {
        const roleName = data.role ?? 'operario';
        const role = await roleRepo.findOne({ where: { name: roleName, isActive: true } });
        if (!role) {
          throw new Error(`Rol no encontrado para seed de usuario: ${roleName}`);
        }
        const { role: _role, ...userData } = data;
        await userRepo.save(userRepo.create({ ...userData, roleId: role.id }));
        console.log(`   ✔ Usuario creado: ${data.codigoUser}`);
      } else {
        console.log(`   ⏭  Usuario ya existe: ${data.codigoUser}`);
      }
    }

    // ── Products ───────────────────────────────────────────────────────────
    console.log('\n📦 Seeding products...');
    const productRepo = AppDataSource.getRepository(ProductEntity);
    const existingCount = await productRepo.count();

    if (existingCount === 0) {
      const entities = productsSeedData.map((d) => productRepo.create(d));
      await productRepo.save(entities);
      console.log(`   ✔ ${entities.length} productos insertados`);
    } else {
      console.log(`   ⏭  Ya existen ${existingCount} productos, se omite seed`);
    }

    // ── Products Kilos ─────────────────────────────────────────────────────
    console.log('\n⚖️  Seeding products_kilos...');
    const kilosRepo = AppDataSource.getRepository(ProductKilosEntity);
    const existingKilosCount = await kilosRepo.count();

    if (existingKilosCount === 0) {
      const entities = productsKilosSeedData.map((d) => kilosRepo.create(d));
      await kilosRepo.save(entities);
      console.log(`   ✔ ${entities.length} registros de kilos insertados`);
    } else {
      console.log(`   ⏭  Ya existen ${existingKilosCount} registros de kilos, se omite seed`);
    }

    await queryRunner.commitTransaction();
    console.log('\n🎉 Seed completado exitosamente');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('\n❌ Error durante el seed:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
