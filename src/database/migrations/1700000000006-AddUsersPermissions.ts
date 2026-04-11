import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersPermissions1700000000006 implements MigrationInterface {
  name = 'AddUsersPermissions1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("code","description")
      VALUES
        ('users:create','Crear usuarios'),
        ('users:list','Listar usuarios')
      ON CONFLICT ("code") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id","permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      JOIN "permissions" p ON p.code IN ('users:create','users:list')
      WHERE r.name = 'admin'
      ON CONFLICT ("role_id","permission_id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE "permission_id" IN (
        SELECT id FROM "permissions" WHERE code IN ('users:create','users:list')
      )
    `);
    await queryRunner.query(`DELETE FROM "permissions" WHERE code IN ('users:create','users:list')`);
  }
}
