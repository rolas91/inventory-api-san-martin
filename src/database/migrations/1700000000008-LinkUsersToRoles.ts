import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkUsersToRoles1700000000008 implements MigrationInterface {
  name = 'LinkUsersToRoles1700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "role_id" INTEGER
    `);

    await queryRunner.query(`
      UPDATE "users" u
      SET "role_id" = r.id
      FROM "roles" r
      WHERE lower(u."rol") = lower(r."name")
        AND u."role_id" IS NULL
    `);

    await queryRunner.query(`
      UPDATE "users"
      SET "role_id" = (SELECT id FROM "roles" WHERE "name" = 'operario' LIMIT 1)
      WHERE "role_id" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role_id" SET NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_role_id" ON "users" ("role_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_role_id_roles_id"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT IF EXISTS "FK_users_role_id_roles_id"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_role_id"`);
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role_id" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "role_id"
    `);
  }
}
