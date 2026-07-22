import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../../auth/domain/interfaces/jwt-payload.interface';
import { ScanEventsBatchDto } from '../../application/dtos/scan-events.dto';
import { ScanEventsRepository } from '../repositories/scan-events.repository';

@ApiTags('ScanEvents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ScanEvents')
export class ScanEventsController {
  constructor(private readonly repo: ScanEventsRepository) {}

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar eventos individuales de escaneo de forma idempotente' })
  batch(@Body() dto: ScanEventsBatchDto, @CurrentUser() user: JwtPayload) {
    return this.repo.ingest(dto, user);
  }

  @Get('sessions')
  sessions(@Query('sessionType') sessionType?: string, @Query('referenceId') referenceIdRaw?: string) {
    const referenceId = referenceIdRaw ? Number(referenceIdRaw) : undefined;
    return this.repo.findSessions(sessionType, Number.isFinite(referenceId) ? referenceId : undefined);
  }

  @Get('events')
  events(@Query('sessionUuid') sessionUuid: string) {
    return this.repo.findEvents(sessionUuid);
  }

  @Get('summary')
  summary(@Query('sessionUuid') sessionUuid: string) {
    return this.repo.summary(sessionUuid);
  }
}
