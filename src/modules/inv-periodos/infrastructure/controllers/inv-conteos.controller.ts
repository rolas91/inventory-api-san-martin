import {
  Body, Controller, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { InvPeriodosRepository } from '../repositories/inv-periodos.repository';
import { UpdateConteoEstadoDto, BatchInvConteoDetalleDto } from '../../application/dtos/inv-conteo.dto';
import { SincronizarCompletoDto } from '../../application/dtos/sincronizar-completo.dto';

@ApiTags('InvConteos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('InvConteos')
export class InvConteosController {
  constructor(private readonly repo: InvPeriodosRepository) {}

  @Put(':id/estado')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Cambiar estado del conteo [admin, supervisor]' })
  @ApiResponse({ status: 200 })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConteoEstadoDto,
  ) {
    return this.repo.updateConteoEstado(id, dto.estado);
  }

  @Get(':conteoId/detalle')
  @ApiOperation({ summary: 'Detalle de un conteo' })
  @ApiResponse({ status: 200 })
  getDetalle(@Param('conteoId', ParseIntPipe) conteoId: number) {
    return this.repo.findDetalleByConteo(conteoId);
  }

  @Post(':conteoId/detalle/batch')
  @Roles('admin', 'supervisor', 'operario')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Insertar batch de detalle en un conteo' })
  @ApiResponse({ status: 201 })
  batchDetalle(
    @Param('conteoId', ParseIntPipe) conteoId: number,
    @Body() dto: BatchInvConteoDetalleDto,
  ) {
    return this.repo.batchInsertDetalle(conteoId, dto.items);
  }

  /**
   * Sincronización completa desde la app móvil.
   * Persiste período + conteo + detalles en una sola transacción atómica.
   * Idempotente: reintentos con los mismos datos no duplican registros.
   */
  @Post('sincronizar-completo')
  @Roles('admin', 'supervisor', 'operario')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Inventario cíclico — sincronizar período + conteo + detalles',
    description:
      '**Transacción atómica.** Busca período existente por ' +
      '(nombre + fechaInicio + responsable + tipo); si no existe lo crea. ' +
      'Ídem conteo por (periodoId + numeroConteo). ' +
      'Detalles se insertan solo si el conteo no tenía registros previos (idempotente).',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        periodoId: 1,
        conteoId: 3,
        detallesInsertados: 42,
        message: 'Sincronización exitosa. Período #1, Conteo #3.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Payload inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  sincronizarCompleto(@Body() dto: SincronizarCompletoDto) {
    return this.repo.sincronizarCompleto(dto);
  }
}
