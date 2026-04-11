import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesPermissions1700000000005 implements MigrationInterface {
  name = 'CreateRolesPermissions1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) NOT NULL UNIQUE,
        "description" VARCHAR(255),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_roles_name" ON "roles" ("name")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "permissions" (
        "id" SERIAL PRIMARY KEY,
        "code" VARCHAR(100) NOT NULL UNIQUE,
        "description" VARCHAR(255),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_permissions_code" ON "permissions" ("code")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "role_permissions" (
        "id" SERIAL PRIMARY KEY,
        "role_id" INTEGER NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
        "permission_id" INTEGER NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_role_permissions_role_permission" UNIQUE ("role_id","permission_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_role_permissions_role_id" ON "role_permissions" ("role_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_role_permissions_permission_id" ON "role_permissions" ("permission_id")`);

    // Roles base
    await queryRunner.query(`
      INSERT INTO "roles" ("name","description")
      VALUES
        ('admin','Administrador del sistema'),
        ('supervisor','Supervisor operativo'),
        ('operario','Operario')
      ON CONFLICT ("name") DO NOTHING
    `);

    // Permisos base
    await queryRunner.query(`
      INSERT INTO "permissions" ("code","description")
      VALUES
        ('authz:manage','Administrar roles y permisos'),
        ('bodegas:create','Crear bodegas'),
        ('bodegas:update','Actualizar bodegas'),
        ('bodegas:delete','Eliminar bodegas'),
        ('ubicaciones:create','Crear ubicaciones'),
        ('ubicaciones:update','Actualizar ubicaciones'),
        ('ubicaciones:delete','Eliminar ubicaciones'),
        ('inv_periodos:create','Crear periodos de inventario'),
        ('inv_periodos:update_estado','Actualizar estado de periodo'),
        ('inv_periodos:create_conteo','Crear conteo en periodo'),
        ('inv_conteos:update_estado','Actualizar estado de conteo'),
        ('inv_conteos:batch_detalle','Insertar detalle batch de conteo'),
        ('inv_conteos:sync_completo','Sincronizar inventario completo'),
        ('recepciones:create','Crear recepciones'),
        ('recepciones:update_estado','Actualizar estado de recepción'),
        ('recepciones:batch_detalle','Insertar detalle batch de recepción'),
        ('recepciones:sync_completa','Sincronizar recepción completa'),
        ('planta:create_product','Crear producto de planta'),
        ('planta:import_products','Importar productos'),
        ('planta:import_products_kilos','Importar productos kilos')
      ON CONFLICT ("code") DO NOTHING
    `);

    // Helper: asignar todos los permisos a admin
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id","permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      CROSS JOIN "permissions" p
      WHERE r.name = 'admin'
      ON CONFLICT ("role_id","permission_id") DO NOTHING
    `);

    // supervisor
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id","permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      JOIN "permissions" p ON p.code IN (
        'inv_periodos:create',
        'inv_periodos:update_estado',
        'inv_periodos:create_conteo',
        'inv_conteos:update_estado',
        'inv_conteos:batch_detalle',
        'inv_conteos:sync_completo',
        'recepciones:create',
        'recepciones:update_estado',
        'recepciones:batch_detalle',
        'recepciones:sync_completa',
        'planta:create_product',
        'planta:import_products',
        'planta:import_products_kilos'
      )
      WHERE r.name = 'supervisor'
      ON CONFLICT ("role_id","permission_id") DO NOTHING
    `);

    // operario
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id","permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      JOIN "permissions" p ON p.code IN (
        'inv_conteos:batch_detalle',
        'inv_conteos:sync_completo',
        'recepciones:batch_detalle',
        'recepciones:sync_completa'
      )
      WHERE r.name = 'operario'
      ON CONFLICT ("role_id","permission_id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_role_permissions_permission_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_role_permissions_role_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_permissions_code"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_roles_name"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
  }
}
