import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUbicacionToRecepcionDetalle1700000000011 implements MigrationInterface {
  name = 'AddUbicacionToRecepcionDetalle1700000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "recepciones_detalle"
      ADD COLUMN IF NOT EXISTS "ubicacion_id" integer
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_recepciones_detalle_ubicacion_id"
      ON "recepciones_detalle" ("ubicacion_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "recepciones_detalle"
      ADD CONSTRAINT "FK_recepciones_detalle_ubicacion"
      FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("id") ON DELETE SET NULL
    `).catch(() => undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "recepciones_detalle"
      DROP CONSTRAINT IF EXISTS "FK_recepciones_detalle_ubicacion"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_recepciones_detalle_ubicacion_id"`);
    await queryRunner.query(`ALTER TABLE "recepciones_detalle" DROP COLUMN IF EXISTS "ubicacion_id"`);
  }
}
