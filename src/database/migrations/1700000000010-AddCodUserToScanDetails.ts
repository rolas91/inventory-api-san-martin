import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodUserToScanDetails1700000000010 implements MigrationInterface {
  name = 'AddCodUserToScanDetails1700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inv_fisico_details"
      ADD COLUMN IF NOT EXISTS "cod_user" character varying(100) NOT NULL DEFAULT ''
    `);
    await queryRunner.query(`
      ALTER TABLE "inv_conteo_detalle"
      ADD COLUMN IF NOT EXISTS "cod_user" character varying(100) NOT NULL DEFAULT ''
    `);
    await queryRunner.query(`
      ALTER TABLE "recepciones_detalle"
      ADD COLUMN IF NOT EXISTS "cod_user" character varying(100) NOT NULL DEFAULT ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recepciones_detalle" DROP COLUMN IF EXISTS "cod_user"`);
    await queryRunner.query(`ALTER TABLE "inv_conteo_detalle" DROP COLUMN IF EXISTS "cod_user"`);
    await queryRunner.query(`ALTER TABLE "inv_fisico_details" DROP COLUMN IF EXISTS "cod_user"`);
  }
}
