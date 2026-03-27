import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── users ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"           SERIAL PRIMARY KEY,
        "codigo_user"  VARCHAR(100) NOT NULL UNIQUE,
        "nombre"       VARCHAR(200) NOT NULL,
        "password"     VARCHAR(255) NOT NULL,
        "isActive"     BOOLEAN NOT NULL DEFAULT true,
        "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_codigo_user" ON "users" ("codigo_user")
    `);

    // ── products ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id"             SERIAL PRIMARY KEY,
        "cod_produccion" VARCHAR(100) NOT NULL,
        "nomb_producto"  VARCHAR(300) NOT NULL,
        "num_producto"   VARCHAR(100) NOT NULL,
        "isActive"       BOOLEAN NOT NULL DEFAULT true,
        "created_at"     TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_cod_produccion" ON "products" ("cod_produccion")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_num_producto" ON "products" ("num_producto")
    `);

    // ── products_kilos ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products_kilos" (
        "id"          SERIAL PRIMARY KEY,
        "cod_producto" VARCHAR(100) NOT NULL,
        "destino_rel"  VARCHAR(200) NOT NULL,
        "isActive"     BOOLEAN NOT NULL DEFAULT true,
        "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_kilos_cod_producto" ON "products_kilos" ("cod_producto")
    `);

    // ── inv_fisico ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inv_fisico" (
        "id"               SERIAL PRIMARY KEY,
        "consecutivo"      INTEGER,
        "fecha"            VARCHAR(50) NOT NULL,
        "cod_producto"     VARCHAR(100) NOT NULL,
        "nomb_producto"    VARCHAR(300) NOT NULL,
        "peso_kilos"       DECIMAL(10,3) NOT NULL DEFAULT 0,
        "peso_libras"      DECIMAL(10,3) NOT NULL DEFAULT 0,
        "bultos"           INTEGER NOT NULL DEFAULT 0,
        "cod_user"         VARCHAR(100) NOT NULL,
        "consecutivo_caja" VARCHAR(500) NOT NULL DEFAULT '',
        "created_at"       TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_inv_fisico_fecha"        ON "inv_fisico" ("fecha")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_inv_fisico_cod_producto" ON "inv_fisico" ("cod_producto")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_inv_fisico_cod_user"     ON "inv_fisico" ("cod_user")
    `);

    // ── inv_fisico_details ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inv_fisico_details" (
        "id"               SERIAL PRIMARY KEY,
        "inv_fisico_id"    INTEGER NOT NULL,
        "numero_producto"  INTEGER,
        "cod_producto"     VARCHAR(100),
        "nomb_producto"    VARCHAR(300),
        "fecha_deshuese"   VARCHAR(50),
        "peso"             DECIMAL(10,3),
        "unidad_medida"    VARCHAR(20),
        "consecutivo_caja" VARCHAR(100),
        "num_maquinas"     VARCHAR(50),
        "lote"             VARCHAR(100),
        "sub_lote"         VARCHAR(100),
        "cod_destino"      VARCHAR(100),
        "cant_piezas"      INTEGER,
        "secuencia"        INTEGER,
        "created_at"       TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_inv_fisico_details_inv_fisico"
          FOREIGN KEY ("inv_fisico_id")
          REFERENCES "inv_fisico"("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "inv_fisico_details"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inv_fisico"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products_kilos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
