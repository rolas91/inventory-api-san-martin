import {
  Body, Controller, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RecepcionesRepository } from '../repositories/recepciones.repository';
import {
  CreateRecepcionDto,
  UpdateRecepcionEstadoDto,
  BatchRecepcionDetalleDto,
} from '../../application/dtos/recepcion.dto';

@ApiTags('Recepciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('Recepciones')
export class RecepcionesController {
  constructor(private readonly repo: RecepcionesRepository) {}

  @Get()
  @ApiOperation({ summary: 'Todas las recepciones' })
  @ApiResponse({ status: 200 })
  getAll() {
    return this.repo.findAll();
  }

  @Post()
  @Roles('admin', 'supervisor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear recepción [admin, supervisor] — numero generado automáticamente' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateRecepcionDto) {
    return this.repo.create(dto);
  }

  @Put(':id/estado')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Cambiar estado recepción [admin, supervisor] — solo avanzar' })
  @ApiResponse({ status: 200 })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecepcionEstadoDto,
  ) {
    return this.repo.updateEstado(id, dto.estado);
  }

  @Get(':recepcionId/detalle')
  @ApiOperation({ summary: 'Detalle de una recepción' })
  @ApiResponse({ status: 200 })
  getDetalle(@Param('recepcionId', ParseIntPipe) recepcionId: number) {
    return this.repo.findDetalle(recepcionId);
  }

  @Post(':recepcionId/detalle/batch')
  @Roles('admin', 'supervisor', 'operario')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Insertar batch de detalle (solo en estado borrador)' })
  @ApiResponse({ status: 201 })
  batchDetalle(
    @Param('recepcionId', ParseIntPipe) recepcionId: number,
    @Body() dto: BatchRecepcionDetalleDto,
  ) {
    return this.repo.batchInsertDetalle(recepcionId, dto.items);
  }

  @Get(':recepcionId/resumen')
  @ApiOperation({ summary: 'Resumen totales de una recepción' })
  @ApiResponse({ status: 200 })
  getResumen(@Param('recepcionId', ParseIntPipe) recepcionId: number) {
    return this.repo.getResumen(recepcionId);
  }
}
