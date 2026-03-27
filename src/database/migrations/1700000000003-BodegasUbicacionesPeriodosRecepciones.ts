import { MigrationInterface, QueryRunner } from 'typeorm';

export class BodegasUbicacionesPeriodosRecepciones1700000000003 implements MigrationInterface {
  name = 'BodegasUbicacionesPeriodosRecepciones1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── bodegas ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bodegas" (
        "id"          SERIAL PRIMARY KEY,
        "codigo"      VARCHAR(20)  NOT NULL UNIQUE,
        "nombre"      VARCHAR(100) NOT NULL,
        "descripcion" VARCHAR(255),
        "activo"      BOOLEAN      NOT NULL DEFAULT true,
        "created_at"  TIMESTAMP    NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP    NOT NULL DEFAULT now()
      )
    `);

    // ── ubicaciones ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ubicaciones" (
        "id"        SERIAL PRIMARY KEY,
        "bodega_id" INTEGER      NOT NULL,
        "codigo"    VARCHAR(20)  NOT NULL,
        "nombre"    VARCHAR(100) NOT NULL,
        "activo"    BOOLEAN      NOT NULL DEFAULT true,
        "created_at" TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "FK_ubicaciones_bodega"
          FOREIGN KEY ("bodega_id") REFERENCES "bodegas"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ubicaciones_bodega_id" ON "ubicaciones" ("bodega_id")
    `);

    // ── inv_periodos ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inv_periodos" (
        "id"          SERIAL PRIMARY KEY,
        "nombre"      VARCHAR(100) NOT NULL,
        "tipo"        VARCHAR(20)  NOT NULL DEFAULT 'completo',
        "bodega_id"   INTEGER,
        "fecha_inicio" DATE        NOT NULL,
        "fecha_fin"   DATE,
        "estado"      VARCHAR(20)  NOT NULL DEFAULT 'abierto',
        "responsable" VARCHAR(50)  NOT NULL,
        "created_at"  TIMESTAMP    NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "FK_inv_periodos_bodega"
          FOREIGN KEY ("bodega_id") REFERENCES "bodegas"("id") ON DELETE SET NULL
      )
    `);

    // ── inv_conteos ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inv_conteos" (
        "id"            SERIAL PRIMARY KEY,
        "periodo_id"    INTEGER     NOT NULL,
        "numero_conteo" INTEGER     NOT NULL DEFAULT 1,
        "responsable"   VARCHAR(50) NOT NULL,
        "estado"        VARCHAR(20) NOT NULL DEFAULT 'en_progreso',
        "fecha"         DATE        NOT NULL,
        "created_at"    TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "FK_inv_conteos_periodo"
          FOREIGN KEY ("periodo_id") REFERENCES "inv_periodos"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_inv_conteos_periodo_id" ON "inv_conteos" ("periodo_id")
    `);

    // ── inv_conteo_detalle ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inv_conteo_detalle" (
        "id"           SERIAL PRIMARY KEY,
        "conteo_id"    INTEGER        NOT NULL,
        "cod_producto" VARCHAR(50)    NOT NULL,
        "nomb_producto" VARCHAR(200)  NOT NULL,
        "ubicacion_id" INTEGER,
        "peso_kilos"   DECIMAL(10,2)  NOT NULL DEFAULT 0,
        "peso_libras"  DECIMAL(10,2)  NOT NULL DEFAULT 0,
        "bultos"       INTEGER        NOT NULL DEFAULT 0,
        "fecha_scan"   DATE           NOT NULL,
        "created_at"   TIMESTAMP      NOT NULL DEFAULT now(),
        CONSTRAINT "FK_inv_conteo_detalle_conteo"
          FOREIGN KEY ("conteo_id") REFERENCES "inv_conteos"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_inv_conteo_detalle_ubicacion"
          FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_inv_conteo_detalle_conteo_id" ON "inv_conteo_detalle" ("conteo_id")
    `);

    // ── recepciones ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "recepciones" (
        "id"           SERIAL PRIMARY KEY,
        "numero"       VARCHAR(30)  NOT NULL UNIQUE,
        "proveedor"    VARCHAR(150) NOT NULL,
        "bodega_id"    INTEGER,
        "orden_compra" VARCHAR(50),
        "fecha"        DATE         NOT NULL,
        "estado"       VARCHAR(20)  NOT NULL DEFAULT 'borrador',
        "observaciones" TEXT,
        "responsable"  VARCHAR(50)  NOT NULL,
        "created_at"   TIMESTAMP    NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "FK_recepciones_bodega"
          FOREIGN KEY ("bodega_id") REFERENCES "bodegas"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_recepciones_fecha"   ON "recepciones" ("fecha")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_recepciones_estado"  ON "recepciones" ("estado")
    `);

    // ── recepciones_detalle ────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "recepciones_detalle" (
        "id"                SERIAL PRIMARY KEY,
        "recepcion_id"      INTEGER        NOT NULL,
        "cod_producto"      VARCHAR(50)    NOT NULL,
        "nomb_producto"     VARCHAR(200)   NOT NULL,
        "cantidad_recibida" INTEGER        NOT NULL DEFAULT 0,
        "peso_kilos"        DECIMAL(10,2)  NOT NULL DEFAULT 0,
        "peso_libras"       DECIMAL(10,2)  NOT NULL DEFAULT 0,
        "fecha_scan"        DATE           NOT NULL,
        "created_at"        TIMESTAMP      NOT NULL DEFAULT now(),
        CONSTRAINT "FK_recepciones_detalle_recepcion"
          FOREIGN KEY ("recepcion_id") REFERENCES "recepciones"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_recepciones_detalle_recepcion_id"
        ON "recepciones_detalle" ("recepcion_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "recepciones_detalle"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recepciones"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inv_conteo_detalle"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inv_conteos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inv_periodos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ubicaciones"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bodegas"`);
  }
}
