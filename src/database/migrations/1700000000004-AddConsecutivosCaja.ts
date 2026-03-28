import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConsecutivosCaja1700000000004 implements MigrationInterface {
  name = 'AddConsecutivosCaja1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "inv_conteo_detalle"
        ADD COLUMN IF NOT EXISTS "consecutivos_caja" VARCHAR(500) NOT NULL DEFAULT ''
    `);
    await queryRunner.query(`
      ALTER TABLE "recepciones_detalle"
        ADD COLUMN IF NOT EXISTS "consecutivos_caja" VARCHAR(500) NOT NULL DEFAULT ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recepciones_detalle" DROP COLUMN IF EXISTS "consecutivos_caja"`);
    await queryRunner.query(`ALTER TABLE "inv_conteo_detalle"  DROP COLUMN IF EXISTS "consecutivos_caja"`);
  }
}
