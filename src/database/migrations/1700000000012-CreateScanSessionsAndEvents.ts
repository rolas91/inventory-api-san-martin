import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScanSessionsAndEvents1700000000012 implements MigrationInterface {
  name = 'CreateScanSessionsAndEvents1700000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "scan_sessions" (
      "id" SERIAL PRIMARY KEY,
      "uuid" uuid NOT NULL UNIQUE,
      "session_type" varchar(30) NOT NULL,
      "reference_id" integer,
      "warehouse_id" integer,
      "status" varchar(30) NOT NULL DEFAULT 'open',
      "created_by" varchar(100) NOT NULL,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_scan_sessions_type_reference" ON "scan_sessions" ("session_type", "reference_id")`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "scan_events" (
      "id" SERIAL PRIMARY KEY,
      "uuid" uuid NOT NULL UNIQUE,
      "session_id" integer NOT NULL REFERENCES "scan_sessions"("id") ON DELETE CASCADE,
      "operation" varchar(30) NOT NULL,
      "quantity_sign" smallint NOT NULL DEFAULT 1,
      "product_code" varchar(100) NOT NULL,
      "product_name" varchar(300) NOT NULL DEFAULT '',
      "box_sequence" varchar(100),
      "original_weight" numeric(12,3) NOT NULL DEFAULT 0,
      "original_unit" varchar(20) NOT NULL DEFAULT 'KG',
      "weight_kg" numeric(12,3) NOT NULL DEFAULT 0,
      "weight_lb" numeric(12,3) NOT NULL DEFAULT 0,
      "lot" varchar(100), "sub_lot" varchar(100), "destination_code" varchar(100),
      "pieces_count" integer, "sequence" integer, "location_id" integer,
      "reference_document" varchar(150), "performed_by" varchar(100) NOT NULL,
      "occurred_at" timestamptz NOT NULL, "reverses_event_uuid" uuid,
      "raw_barcode" text, "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_scan_events_sign" CHECK ("quantity_sign" IN (-1, 1))
    )`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_scan_events_session" ON "scan_events" ("session_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_scan_events_product" ON "scan_events" ("product_code")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_scan_events_box" ON "scan_events" ("box_sequence")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "scan_events"');
    await queryRunner.query('DROP TABLE IF EXISTS "scan_sessions"');
  }
}
