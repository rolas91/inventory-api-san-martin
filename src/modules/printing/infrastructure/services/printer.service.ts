import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getPrinters as getSystemPrinters, print as printPdf } from 'pdf-to-printer';

@Injectable()
export class PrinterService {
  private readonly logger = new Logger(PrinterService.name);
  private readonly execFileAsync = promisify(execFile);

  async getPrinters(): Promise<{ name: string }[]> {
    const printerNames = await this.getInstalledPrinterNames();
    if (printerNames.length === 0) {
      throw new NotFoundException('No se encontraron impresoras instaladas.');
    }

    return printerNames.map((name) => ({ name }));
  }

  async getLocalIP(): Promise<{ machineName: string; localIPs: string[] }> {
    const hostName = os.hostname();
    const interfaces = os.networkInterfaces();

    const localIPs: string[] = [];
    for (const list of Object.values(interfaces)) {
      for (const item of list ?? []) {
        if (item && item.family === 'IPv4') {
          localIPs.push(item.address);
        }
      }
    }

    return { machineName: hostName, localIPs };
  }

  async printTicket(file: Express.Multer.File, printerName: string): Promise<{ message: string }> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      // En el controlador se valida el contenido, pero esto protege el servicio.
      throw new BadRequestException('No se envio ningun archivo.');
    }

    if (!printerName || printerName.trim().length === 0) {
      throw new BadRequestException('No se ingreso nombre de impresora.');
    }

    const printerNames = await this.getInstalledPrinterNames();
    const resolvedPrinterName = this.resolvePrinterName(printerName, printerNames);
    if (!resolvedPrinterName) {
      this.logger.warn(
        `Impresora no encontrada. Solicitada='${printerName}'. Disponibles=${JSON.stringify(printerNames)}`,
      );
      throw new NotFoundException(`La impresora '${printerName}' no esta instalada en este equipo.`);
    }

    const tempFilePath = path.join(os.tmpdir(), `${randomUUID()}.pdf`);
    await fs.promises.writeFile(tempFilePath, file.buffer);

    try {
      const safePrinterName = this.formatPrinterNameForWindowsCommand(resolvedPrinterName);
      try {
        await printPdf(tempFilePath, {
          printer: safePrinterName,
          scale: 'fit',
          silent: true,
        });
      } catch (primaryError) {
        // Fallback Windows sin shell: evita problemas de parseo de argumentos.
        if (process.platform !== 'win32') throw primaryError;
        this.logger.warn(
          `printPdf fallo. Reintentando con Sumatra directo. Detalle: ${
            primaryError instanceof Error ? primaryError.message : String(primaryError)
          }`,
        );
        const candidates = this.buildPrinterCandidates(printerName, printerNames, resolvedPrinterName);
        let printed = false;
        let lastError: unknown = primaryError;
        for (const candidate of candidates) {
          try {
            await this.printWithSumatraDirect(tempFilePath, candidate);
            printed = true;
            this.logger.log(`Impresion OK con candidato='${candidate}'`);
            break;
          } catch (candidateError) {
            lastError = candidateError;
            this.logger.warn(
              `Fallo candidato='${candidate}': ${
                candidateError instanceof Error ? candidateError.message : String(candidateError)
              }`,
            );
          }
        }
        if (!printed) {
          try {
            await this.printWithSumatraDefault(tempFilePath);
            printed = true;
            this.logger.warn(
              `Impresion enviada a impresora predeterminada tras fallar '${resolvedPrinterName}'.`,
            );
          } catch (defaultError) {
            lastError = defaultError;
          }
        }
        if (!printed) throw lastError;
      }

      return { message: 'PDF enviado a imprimir correctamente.' };
    } catch (ex) {
      const detail = this.describeCommandError(ex);
      this.logger.error(`Error al imprimir PDF: ${detail}`);
      throw new InternalServerErrorException(`Error al imprimir el PDF: ${detail}`);
    } finally {
      try {
        await fs.promises.unlink(tempFilePath);
      } catch {
        // Ignorar si ya fue eliminado o no existe.
      }
    }
  }

  private async getInstalledPrinterNames(): Promise<string[]> {
    try {
      const printers = await getSystemPrinters();
      return printers
        .map((p) => p.name?.trim())
        .filter((name): name is string => Boolean(name));
    } catch (ex) {
      const detail = ex instanceof Error ? ex.message : String(ex);
      this.logger.error(`Error al listar impresoras: ${detail}`);
      throw new InternalServerErrorException('Error interno del servidor al listar impresoras.');
    }
  }

  private resolvePrinterName(requested: string, installed: string[]): string | null {
    const reqTrim = requested.trim();
    if (!reqTrim) return null;

    // 1) Match exacto primero.
    const exact = installed.find((p) => p === reqTrim);
    if (exact) return exact;

    // 2) Match normalizado (case-insensitive, sin espacios repetidos).
    const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();
    const reqNorm = normalize(reqTrim);
    const normalized = installed.find((p) => normalize(p) === reqNorm);
    if (normalized) return normalized;

    // 3) Match flexible por inclusión para variaciones de driver/sufijos.
    const partial = installed.find((p) => {
      const pNorm = normalize(p);
      return pNorm.includes(reqNorm) || reqNorm.includes(pNorm);
    });
    if (partial) return partial;

    return null;
  }

  private formatPrinterNameForWindowsCommand(printerName: string): string {
    const trimmed = printerName.trim();
    if (!trimmed) return trimmed;

    // pdf-to-printer en Windows puede fallar cuando el nombre incluye espacios/paréntesis
    // si no va entre comillas.
    if (process.platform === 'win32') {
      const alreadyQuoted = trimmed.startsWith('"') && trimmed.endsWith('"');
      if (!alreadyQuoted) {
        return `"${trimmed.replace(/"/g, '\\"')}"`;
      }
    }

    return trimmed;
  }

  private async printWithSumatraDirect(filePath: string, printerName: string): Promise<void> {
    const sumatraPath = path.resolve(
      process.cwd(),
      'node_modules',
      'pdf-to-printer',
      'dist',
      'SumatraPDF-3.4.6-32.exe',
    );

    await this.execFileAsync(sumatraPath, [
      '-print-to',
      printerName,
      '-silent',
      '-print-settings',
      'fit',
      filePath,
    ]);
  }

  private async printWithSumatraDefault(filePath: string): Promise<void> {
    const sumatraPath = path.resolve(
      process.cwd(),
      'node_modules',
      'pdf-to-printer',
      'dist',
      'SumatraPDF-3.4.6-32.exe',
    );

    await this.execFileAsync(sumatraPath, ['-print-to-default', '-silent', '-print-settings', 'fit', filePath]);
  }

  private buildPrinterCandidates(
    requestedPrinter: string,
    installed: string[],
    resolvedPrinterName: string,
  ): string[] {
    const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();
    const reqNorm = normalize(requestedPrinter);
    const resNorm = normalize(resolvedPrinterName);

    const startsWithOrContains = installed.filter((name) => {
      const n = normalize(name);
      return n.includes(reqNorm) || reqNorm.includes(n) || n.startsWith(reqNorm) || n.startsWith(resNorm);
    });

    const unique = new Set<string>([resolvedPrinterName, ...startsWithOrContains]);
    return Array.from(unique);
  }

  private describeCommandError(error: unknown): string {
    if (!error || typeof error !== 'object') {
      return String(error);
    }
    const err = error as {
      message?: string;
      code?: number | string;
      stdout?: string;
      stderr?: string;
    };
    const chunks = [err.message ?? 'Error desconocido'];
    if (err.code !== undefined) chunks.push(`code=${String(err.code)}`);
    if (err.stderr?.trim()) chunks.push(`stderr=${err.stderr.trim()}`);
    if (err.stdout?.trim()) chunks.push(`stdout=${err.stdout.trim()}`);
    return chunks.join(' | ');
  }

}

