import { BadRequestException } from '@nestjs/common';

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Express/Nest pueden entregar string o array si el query se repite. */
function coerceQueryStringParam(raw?: string | string[]): string | undefined {
  if (raw === undefined) return undefined;
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (first === undefined || first === null) return undefined;
  const s = String(first).trim();
  return s === '' ? undefined : s;
}

/** Valida query opcional `fecha` (YYYY-MM-DD). Vacío/undefined → sin filtro. */
export function parseOptionalFechaQuery(raw?: string | string[]): string | undefined {
  const s = coerceQueryStringParam(raw);
  if (s === undefined) return undefined;
  if (!FECHA_REGEX.test(s)) {
    throw new BadRequestException('Query "fecha" debe tener formato YYYY-MM-DD');
  }
  return s;
}
