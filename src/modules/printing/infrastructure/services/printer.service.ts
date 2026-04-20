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
import { getPrinters as getSystemPrinters, print as printPdf } from 'pdf-to-printer';

@Injectable()
export class PrinterService {
  private readonly logger = new Logger(PrinterService.name);

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
      await printPdf(tempFilePath, {
        printer: resolvedPrinterName,
        scale: 'fit',
        silent: true,
      });

      return { message: 'PDF enviado a imprimir correctamente.' };
    } catch (ex) {
      const detail = ex instanceof Error ? ex.message : String(ex);
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

}

