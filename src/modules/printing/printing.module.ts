import { Module } from '@nestjs/common';
import { PrinterController } from './infrastructure/controllers/printer.controller';
import { PrinterService } from './infrastructure/services/printer.service';

@Module({
  controllers: [PrinterController],
  providers: [PrinterService],
})
export class PrintingModule {}

