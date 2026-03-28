import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { ProductEntity } from '../../domain/entities/product.entity';

export interface CsvImportResult {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; value: string; reason: string }>;
}

/** Columnas esperadas en el CSV (insensible a mayúsculas/espacios) */
const CSV_COLUMNS = ['codproduccion', 'nombproducto', 'numproducto'] as const;

@Injectable()
export class ImportProductsCsvUseCase {
  private readonly logger = new Logger(ImportProductsCsvUseCase.name);

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async execute(fileBuffer: Buffer): Promise<CsvImportResult> {
    // ── 1. Parsear CSV ─────────────────────────────────────────────────────
    let rows: Record<string, string>[];
    try {
      rows = parse(fileBuffer, {
        columns: (header: string[]) =>
          header.map((h) => h.trim().toLowerCase().replace(/\s+/g, '')),
        skip_empty_lines: true,
        trim: true,
        bom: true,            // soporta BOM UTF-8 de Excel
        relax_column_count: true,
      });
    } catch (e) {
      throw new BadRequestException(`No se pudo parsear el CSV: ${(e as Error).message}`);
    }

    if (rows.length === 0) {
      throw new BadRequestException('El CSV está vacío');
    }

    // ── 2. Validar columnas ────────────────────────────────────────────────
    const firstRow = rows[0];
    const missing = CSV_COLUMNS.filter((col) => !(col in firstRow));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Columnas faltantes en el CSV: ${missing.join(', ')}. ` +
        `Se esperan: codProduccion, nombProducto, numProducto`,
      );
    }

    // ── 3. Procesar fila por fila ──────────────────────────────────────────
    const result: CsvImportResult = {
      total: rows.length,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 porque la fila 1 es el header

      const codProduccion = row['codproduccion']?.trim() ?? '';
      const nombProducto  = row['nombproducto']?.trim()  ?? '';
      const numProducto   = row['numproducto']?.trim()   ?? '';

      // Validaciones por fila
      if (!codProduccion) {
        result.errors.push({ row: rowNum, value: codProduccion, reason: 'codProduccion vacío' });
        result.skipped++;
        continue;
      }
      if (!nombProducto) {
        result.errors.push({ row: rowNum, value: codProduccion, reason: 'nombProducto vacío' });
        result.skipped++;
        continue;
      }

      try {
        const existing = await this.productRepo.findOne({
          where: { codProduccion },
        });

        if (existing) {
          // Actualiza nombre y numProducto si cambiaron
          const changed =
            existing.nombProducto !== nombProducto ||
            existing.numProducto  !== numProducto;

          if (changed) {
            existing.nombProducto = nombProducto;
            existing.numProducto  = numProducto;
            existing.isActive     = true;
            await this.productRepo.save(existing);
            result.updated++;
          } else {
            result.skipped++;
          }
        } else {
          await this.productRepo.save(
            this.productRepo.create({
              codProduccion,
              nombProducto,
              numProducto,
              isActive: true,
              // createdAt y updatedAt los maneja TypeORM automáticamente
            }),
          );
          result.inserted++;
        }
      } catch (err) {
        this.logger.warn(`Error en fila ${rowNum}: ${(err as Error).message}`);
        result.errors.push({
          row: rowNum,
          value: codProduccion,
          reason: (err as Error).message,
        });
        result.skipped++;
      }
    }

    return result;
  }
}
