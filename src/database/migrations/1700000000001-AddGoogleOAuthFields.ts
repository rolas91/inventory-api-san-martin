import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleOAuthFields1700000000001 implements MigrationInterface {
  name = 'AddGoogleOAuthFields1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "google_id" VARCHAR(255) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS "email"     VARCHAR(255) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS "picture"   VARCHAR(500) DEFAULT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
        ADD CONSTRAINT "UQ_users_google_id" UNIQUE ("google_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_google_id" ON "users" ("google_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_google_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_email"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_google_id"`);
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "picture",
        DROP COLUMN IF EXISTS "email",
        DROP COLUMN IF EXISTS "google_id"
    `);
  }
}
