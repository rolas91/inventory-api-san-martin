import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

@Injectable()
export class PrinterService {
  private readonly logger = new Logger(PrinterService.name);

  async getPrinters(): Promise<{ name: string }[]> {
    const printerNames = await this.getPrinterNames();
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

    const printerNames = await this.getPrinterNames();
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
      await this.printWithSumatra(tempFilePath, resolvedPrinterName);

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

  async getPrintersNodePrinterPoc(): Promise<{ name: string }[]> {
    // @alexssmusica/node-printer deshabilitado (incompatibilidad / build nativo). Misma fuente que GET printer/list.
    return this.getPrinters();
  }

  async printTicketNodePrinterPoc(
    file: Express.Multer.File,
    printerName: string,
  ): Promise<{ message: string }> {
    // @alexssmusica/node-printer deshabilitado (import dinámico y printDirect). Misma lógica que POST printer/print-ticket.
    //
    // Código anterior (referencia, no ejecutar):
    // const printerModule = await this.getNodePrinterModule();
    // printerModule.printDirect({ data: file.buffer, printer: resolvedPrinterName, type: 'PDF', ... });
    const result = await this.printTicket(file, printerName);
    return {
      message: `${result.message} (POC: sin node-printer; impresión vía flujo estándar.)`,
    };
  }

  private async getPrinterNames(): Promise<string[]> {
    try {
      const { stdout } = await execFileAsync(
        'powershell',
        [
          '-NoProfile',
          '-ExecutionPolicy',
          'Bypass',
          '-Command',
          'Get-CimInstance -ClassName Win32_Printer | Select-Object -ExpandProperty Name',
        ],
        {
          windowsHide: true,
          timeout: 120000,
          maxBuffer: 1024 * 1024,
        },
      );

      return stdout
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
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

  private async printWithSumatra(pdfPath: string, printer: string): Promise<void> {
    const sumatraExe = path.join(
      process.cwd(),
      'node_modules',
      'pdf-to-printer',
      'dist',
      'SumatraPDF-3.4.6-32.exe',
    );

    await execFileAsync(
      sumatraExe,
      ['-print-to', printer, '-silent', '-print-settings', 'fit', pdfPath],
      {
        windowsHide: true,
        timeout: 120000,
        maxBuffer: 1024 * 1024,
      },
    );
  }

  /*
  // ── getNodePrinterModule — DESHABILITADO: @alexssmusica/node-printer (compatibilidad / addon nativo)
  // private async getNodePrinterModule(): Promise<{ ... }> {
  //   try {
  //     const moduleRef = await import('@alexssmusica/node-printer');
  //     return (moduleRef as { default?: unknown }).default
  //       ? ((moduleRef as { default: unknown }).default as { getPrinters; printDirect })
  //       : (moduleRef as unknown as { getPrinters; printDirect });
  //   } catch (ex) {
  //     const detail = ex instanceof Error ? ex.message : String(ex);
  //     throw new Error(`No se pudo cargar @alexssmusica/node-printer. Detalle: ${detail}`);
  //   }
  // }
  */

}

