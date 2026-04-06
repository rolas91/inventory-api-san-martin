import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrinterService } from '../services/printer.service';
import type { Express } from 'express';

@ApiTags('Impresion')
@Controller('printer')
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {}

  @Get('list')
  @ApiOperation({ summary: 'Listar impresoras instaladas' })
  @ApiResponse({ status: 200, schema: { example: [{ name: 'Mi Impresora' }] } })
  async listPrinters() {
    return this.printerService.getPrinters();
  }

  @Get('get-local-ip')
  @ApiOperation({ summary: 'Obtener IP local del equipo' })
  @ApiResponse({
    status: 200,
    schema: { example: { machineName: 'PC-1', localIPs: ['192.168.0.10'] } },
  })
  async getLocalIP() {
    return this.printerService.getLocalIP();
  }

  @Post('print-ticket')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.toLowerCase().endsWith('.pdf')) {
          return cb(new BadRequestException('Solo se aceptan archivos .pdf'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo PDF con campo file y nombre de impresora en printerName',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        printerName: { type: 'string' },
      },
      required: ['file', 'printerName'],
    },
  })
  @ApiOperation({ summary: 'Imprimir PDF en una impresora instalada' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'PDF enviado a imprimir correctamente.' } },
  })
  async printTicket(
    @UploadedFile() file: Express.Multer.File,
    @Body('printerName') printerName: string,
  ) {
    return this.printerService.printTicket(file, printerName);
  }

  @Get('_printer-test/list')
  @ApiOperation({ summary: 'POC: listar impresoras con @alexssmusica/node-printer' })
  @ApiResponse({ status: 200, schema: { example: [{ name: 'Mi Impresora' }] } })
  async listPrintersNodePrinterPoc() {
    return this.printerService.getPrintersNodePrinterPoc();
  }

  @Post('_printer-test/print-ticket')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.toLowerCase().endsWith('.pdf')) {
          return cb(new BadRequestException('Solo se aceptan archivos .pdf'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'POC node-printer: archivo PDF + printerName',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        printerName: { type: 'string' },
      },
      required: ['file', 'printerName'],
    },
  })
  @ApiOperation({ summary: 'POC: imprimir PDF con @alexssmusica/node-printer' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'POC node-printer: PDF enviado a imprimir correctamente.' } },
  })
  async printTicketNodePrinterPoc(
    @UploadedFile() file: Express.Multer.File,
    @Body('printerName') printerName: string,
  ) {
    return this.printerService.printTicketNodePrinterPoc(file, printerName);
  }
}

