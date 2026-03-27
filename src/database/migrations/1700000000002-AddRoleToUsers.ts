import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUsers1700000000002 implements MigrationInterface {
  name = 'AddRoleToUsers1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "rol" VARCHAR(20) NOT NULL DEFAULT 'operario'
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_rol" ON "users" ("rol")
    `);
    // Primer usuario existente pasa a admin
    await queryRunner.query(`
      UPDATE "users" SET "rol" = 'admin' WHERE id = (SELECT MIN(id) FROM "users")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_rol"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "rol"`);
  }
}
