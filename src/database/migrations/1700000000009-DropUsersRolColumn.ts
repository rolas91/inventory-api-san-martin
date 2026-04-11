import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUsersRolColumn1700000000009 implements MigrationInterface {
  name = 'DropUsersRolColumn1700000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_rol"`);
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "rol"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "rol" VARCHAR(20) NOT NULL DEFAULT 'operario'
    `);
    await queryRunner.query(`
      UPDATE "users" u
      SET "rol" = COALESCE(r."name", 'operario')
      FROM "roles" r
      WHERE u."role_id" = r."id"
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_rol" ON "users" ("rol")
    `);
  }
}
