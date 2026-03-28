import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { ProductKilosEntity } from '../../domain/entities/product-kilos.entity';

export interface CsvKilosImportResult {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; value: string; reason: string }>;
}

/** Par único: codProducto + destinoRel */
const CSV_COLUMNS = ['codproducto', 'destinorel'] as const;

@Injectable()
export class ImportProductsKilosCsvUseCase {
  private readonly logger = new Logger(ImportProductsKilosCsvUseCase.name);

  constructor(
    @InjectRepository(ProductKilosEntity)
    private readonly kilosRepo: Repository<ProductKilosEntity>,
  ) {}

  async execute(fileBuffer: Buffer): Promise<CsvKilosImportResult> {
    // ── 1. Parsear CSV ─────────────────────────────────────────────────────
    let rows: Record<string, string>[];
    try {
      rows = parse(fileBuffer, {
        columns: (header: string[]) =>
          header.map((h) => h.trim().toLowerCase().replace(/\s+/g, '')),
        skip_empty_lines: true,
        trim: true,
        bom: true,
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
        `Se esperan: codProducto, destinoRel`,
      );
    }

    // ── 3. Procesar fila por fila ──────────────────────────────────────────
    const result: CsvKilosImportResult = {
      total: rows.length,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const codProducto = row['codproducto']?.trim() ?? '';
      const destinoRel  = row['destinorel']?.trim()  ?? '';

      if (!codProducto) {
        result.errors.push({ row: rowNum, value: codProducto, reason: 'codProducto vacío' });
        result.skipped++;
        continue;
      }
      if (!destinoRel && destinoRel !== '0') {
        result.errors.push({ row: rowNum, value: codProducto, reason: 'destinoRel vacío' });
        result.skipped++;
        continue;
      }

      try {
        // La unicidad es por el par (codProducto + destinoRel)
        const existing = await this.kilosRepo.findOne({
          where: { codProducto, destinoRel },
        });

        if (existing) {
          // El par ya existe; solo reactiva si estaba inactivo
          if (!existing.isActive) {
            existing.isActive = true;
            await this.kilosRepo.save(existing);
            result.updated++;
          } else {
            result.skipped++;
          }
        } else {
          await this.kilosRepo.save(
            this.kilosRepo.create({ codProducto, destinoRel, isActive: true }),
          );
          result.inserted++;
        }
      } catch (err) {
        this.logger.warn(`Error en fila ${rowNum}: ${(err as Error).message}`);
        result.errors.push({
          row: rowNum,
          value: `${codProducto}|${destinoRel}`,
          reason: (err as Error).message,
        });
        result.skipped++;
      }
    }

    return result;
  }
}
