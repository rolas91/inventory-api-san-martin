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
    try {
      const printerModule = await this.getNodePrinterModule();
      const printers = printerModule.getPrinters();
      const names = (Array.isArray(printers) ? printers : [])
        .map((p: { name?: string }) => p?.name?.trim())
        .filter((name: string | undefined): name is string => !!name);

      if (names.length === 0) {
        throw new NotFoundException('No se encontraron impresoras instaladas (POC node-printer).');
      }

      return names.map((name) => ({ name }));
    } catch (ex) {
      const detail = ex instanceof Error ? ex.message : String(ex);
      this.logger.error(`POC node-printer (list) fallo: ${detail}`);
      throw new InternalServerErrorException(`POC node-printer fallo al listar impresoras: ${detail}`);
    }
  }

  async printTicketNodePrinterPoc(
    file: Express.Multer.File,
    printerName: string,
  ): Promise<{ message: string }> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('No se envio ningun archivo.');
    }
    if (!printerName || printerName.trim().length === 0) {
      throw new BadRequestException('No se ingreso nombre de impresora.');
    }

    const printerModule = await this.getNodePrinterModule();
    const rawPrinters = printerModule.getPrinters();
    const installedNames = (Array.isArray(rawPrinters) ? rawPrinters : [])
      .map((p: { name?: string }) => p?.name?.trim())
      .filter((name: string | undefined): name is string => !!name);

    const resolvedPrinterName = this.resolvePrinterName(printerName, installedNames);
    if (!resolvedPrinterName) {
      throw new NotFoundException(`La impresora '${printerName}' no esta instalada en este equipo (POC).`);
    }

    try {
      await new Promise<void>((resolve, reject) => {
        printerModule.printDirect({
          data: file.buffer,
          printer: resolvedPrinterName,
          docname: file.originalname || 'poc-node-printer.pdf',
          type: 'PDF',
          success: () => resolve(),
          error: (error: Error) => reject(error),
        });
      });

      return { message: 'POC node-printer: PDF enviado con printDirect (type PDF).' };
    } catch (ex) {
      const detail = ex instanceof Error ? ex.message : String(ex);
      this.logger.warn(`POC node-printer printDirect fallo: ${detail}. Intentando fallback Sumatra.`);

      const tempFilePath = path.join(os.tmpdir(), `${randomUUID()}.pdf`);
      await fs.promises.writeFile(tempFilePath, file.buffer);
      try {
        await this.printWithSumatra(tempFilePath, resolvedPrinterName);
        return {
          message:
            'POC node-printer: printDirect no pudo completar; se imprimio con fallback Sumatra.',
        };
      } catch (sumatraEx) {
        const sumatraDetail = sumatraEx instanceof Error ? sumatraEx.message : String(sumatraEx);
        this.logger.error(`POC fallback Sumatra fallo: ${sumatraDetail}`);
        throw new InternalServerErrorException(
          `POC node-printer fallo (printDirect): ${detail}. Fallback Sumatra: ${sumatraDetail}`,
        );
      } finally {
        try {
          await fs.promises.unlink(tempFilePath);
        } catch {
          // no-op
        }
      }
    }
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

  private async getNodePrinterModule(): Promise<{
    getPrinters: () => Array<{ name?: string }>;
    printDirect: (options: {
      data: string | Buffer;
      printer?: string;
      docname?: string;
      type?: 'RAW' | 'TEXT' | 'PDF' | 'JPEG' | 'POSTSCRIPT' | 'COMMAND' | 'AUTO';
      success?: (jobId: string) => void;
      error?: (err: Error) => void;
    }) => void;
  }> {
    try {
      const moduleRef = await import('@alexssmusica/node-printer');
      return (moduleRef as { default?: unknown }).default
        ? ((moduleRef as { default: unknown }).default as {
            getPrinters: () => Array<{ name?: string }>;
            printDirect: (options: {
              data: string | Buffer;
              printer?: string;
              docname?: string;
              type?: 'RAW' | 'TEXT' | 'PDF' | 'JPEG' | 'POSTSCRIPT' | 'COMMAND' | 'AUTO';
              success?: (jobId: string) => void;
              error?: (err: Error) => void;
            }) => void;
          })
        : (moduleRef as unknown as {
            getPrinters: () => Array<{ name?: string }>;
            printDirect: (options: {
              data: string | Buffer;
              printer?: string;
              docname?: string;
              type?: 'RAW' | 'TEXT' | 'PDF' | 'JPEG' | 'POSTSCRIPT' | 'COMMAND' | 'AUTO';
              success?: (jobId: string) => void;
              error?: (err: Error) => void;
            }) => void;
          });
    } catch (ex) {
      const detail = ex instanceof Error ? ex.message : String(ex);
      throw new Error(
        `No se pudo cargar @alexssmusica/node-printer. Verifica instalacion/build nativo. Detalle: ${detail}`,
      );
    }
  }

}

