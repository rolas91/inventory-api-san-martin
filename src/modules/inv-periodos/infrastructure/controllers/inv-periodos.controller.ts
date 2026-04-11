import {
  Body, Controller, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../../../../common/auth/permissions';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { InvPeriodosRepository } from '../repositories/inv-periodos.repository';
import { CreateInvPeriodoDto, UpdatePeriodoEstadoDto } from '../../application/dtos/inv-periodo.dto';
import { CreateInvConteoDto } from '../../application/dtos/inv-conteo.dto';

@ApiTags('InvPeriodos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('InvPeriodos')
export class InvPeriodosController {
  constructor(private readonly repo: InvPeriodosRepository) {}

  @Get()
  @ApiOperation({ summary: 'Todos los períodos de inventario' })
  @ApiResponse({ status: 200 })
  getAll() {
    return this.repo.findAllPeriodos();
  }

  @Post()
  @Permissions(PERMISSIONS.INV_PERIODOS_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear período [admin, supervisor]' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateInvPeriodoDto) {
    return this.repo.createPeriodo(dto);
  }

  @Put(':id/estado')
  @Permissions(PERMISSIONS.INV_PERIODOS_UPDATE_ESTADO)
  @ApiOperation({ summary: 'Cambiar estado del período [admin, supervisor]' })
  @ApiResponse({ status: 200 })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePeriodoEstadoDto,
  ) {
    return this.repo.updatePeriodoEstado(id, dto.estado);
  }

  @Get(':periodoId/conteos')
  @ApiOperation({ summary: 'Conteos de un período con totales' })
  @ApiResponse({ status: 200 })
  getConteos(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.repo.findConteosByPeriodo(periodoId);
  }

  @Post(':periodoId/conteos')
  @Permissions(PERMISSIONS.INV_PERIODOS_CREATE_CONTEO)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear conteo en un período [admin, supervisor]' })
  @ApiResponse({ status: 201 })
  createConteo(
    @Param('periodoId', ParseIntPipe) periodoId: number,
    @Body() dto: CreateInvConteoDto,
  ) {
    return this.repo.createConteo(periodoId, dto);
  }
}
