import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserManagePermissions1700000000007 implements MigrationInterface {
  name = 'AddUserManagePermissions1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("code","description")
      VALUES
        ('users:update_role','Actualizar rol de usuario'),
        ('users:update_status','Actualizar estado de usuario')
      ON CONFLICT ("code") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id","permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      JOIN "permissions" p ON p.code IN ('users:update_role','users:update_status')
      WHERE r.name = 'admin'
      ON CONFLICT ("role_id","permission_id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE "permission_id" IN (
        SELECT id FROM "permissions" WHERE code IN ('users:update_role','users:update_status')
      )
    `);
    await queryRunner.query(`DELETE FROM "permissions" WHERE code IN ('users:update_role','users:update_status')`);
  }
}
