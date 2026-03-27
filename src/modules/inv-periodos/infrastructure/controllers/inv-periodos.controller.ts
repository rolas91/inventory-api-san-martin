import {
  Body, Controller, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
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
  @Roles('admin', 'supervisor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear período [admin, supervisor]' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateInvPeriodoDto) {
    return this.repo.createPeriodo(dto);
  }

  @Put(':id/estado')
  @Roles('admin', 'supervisor')
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
  @Roles('admin', 'supervisor')
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
