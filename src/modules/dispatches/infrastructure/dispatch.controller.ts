import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../../common/auth/permissions';
import type { JwtPayload } from '../../auth/domain/interfaces/jwt-payload.interface';
import { CreateDispatchDto, UpdateDispatchStatusDto } from '../application/dispatch.dto';
import { DispatchRepository } from './dispatch.repository';
import { ScanEventsRepository } from '../../scan-events/infrastructure/repositories/scan-events.repository';
@ApiTags('Dispatches') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('Dispatches')
export class DispatchController {
  constructor(private readonly repo: DispatchRepository, private readonly events: ScanEventsRepository) {}
  @Get() all() { return this.repo.findAll(); }
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.repo.findOne(id); }
  @Get(':id/summary') summary(@Param('id', ParseIntPipe) id: number) { return this.events.summaryByReference('dispatch', id); }
  @Post() @Permissions(PERMISSIONS.DISPATCHES_CREATE) create(@Body() dto: CreateDispatchDto, @CurrentUser() user: JwtPayload) { return this.repo.create(dto, user); }
  @Put(':id/status') @Permissions(PERMISSIONS.DISPATCHES_UPDATE_STATUS) status(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDispatchStatusDto) { return this.repo.updateStatus(id, dto.estado); }
  @Post(':id/reverse') @Permissions(PERMISSIONS.DISPATCHES_UPDATE_STATUS) async reverse(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) { const dispatch = await this.repo.findOne(id); if (dispatch.estado !== 'dispatched') return this.repo.markCancelled(id); const result = await this.events.reverseByReference('dispatch', id, user); await this.repo.markCancelled(id); return result; }
}
