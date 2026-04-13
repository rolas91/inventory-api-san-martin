import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseArrayPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { parseOptionalFechaQuery } from '../../../../common/utils/fecha-query.util';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { BatchInvFisicoUseCase } from '../../application/use-cases/batch-inv-fisico.use-case';
import { DeleteAllInvFisicoUseCase } from '../../application/use-cases/delete-all-inv-fisico.use-case';
import { InvFisicoItemDto } from '../../application/dtos/inv-fisico-batch.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../auth/domain/interfaces/jwt-payload.interface';
import { InvFisicoRepository } from '../repositories/inv-fisico.repository';

@ApiTags('InvFisico')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('InvFisico')
export class InvFisicoController {
  constructor(
    private readonly batchUseCase: BatchInvFisicoUseCase,
    private readonly deleteAllUseCase: DeleteAllInvFisicoUseCase,
    private readonly invFisicoRepo: InvFisicoRepository,
  ) {}

  /**
   * La app envía un array plano: [{...}, {...}]
   * ParseArrayPipe valida cada elemento contra InvFisicoItemDto.
   */
  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Inventario rápido — batch de líneas',
    description:
      'Recibe un **array plano** de registros (no un wrapper). ' +
      'Cada línea se persiste directamente en `inv_fisico`.',
  })
  @ApiBody({ type: [InvFisicoItemDto] })
  @ApiResponse({ status: 200, schema: { example: { success: true, count: 10 } } })
  async batch(
    @Body(new ParseArrayPipe({ items: InvFisicoItemDto }))
    items: InvFisicoItemDto[],
    @CurrentUser() _user: JwtPayload,
  ): Promise<{ success: boolean; count: number }> {
    return this.batchUseCase.execute(items);
  }

  @Delete('delete-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar todos los registros de inventario físico' })
  @ApiResponse({ status: 204 })
  async deleteAll(): Promise<void> {
    await this.deleteAllUseCase.execute();
  }

  @Get('encabezados')
  @ApiOperation({ summary: 'Listar cabeceras de inventario físico (con conteo de detalles)' })
  @ApiQuery({ name: 'fecha', required: false, example: '2026-04-13', description: 'YYYY-MM-DD (campo cabecera fecha)' })
  @ApiResponse({ status: 200 })
  getEncabezados(@Query('fecha') fechaRaw?: string | string[]) {
    const fecha = parseOptionalFechaQuery(fechaRaw);
    return this.invFisicoRepo.findAllHeaders(fecha);
  }

  @Get('lineas')
  @ApiOperation({
    summary: 'Líneas planas: cabecera + detalle por fila (escaneo / detalle de un inventario)',
    description:
      'Sin `invFisicoId` devuelve todas las líneas. Con `invFisicoId` solo las de esa cabecera.',
  })
  @ApiQuery({ name: 'fecha', required: false, example: '2026-04-13', description: 'YYYY-MM-DD (filtra por fecha de cabecera)' })
  @ApiResponse({ status: 200 })
  getLineas(
    @Query('invFisicoId') invFisicoIdRaw?: string,
    @Query('fecha') fechaRaw?: string | string[],
  ) {
    const fecha = parseOptionalFechaQuery(fechaRaw);
    if (invFisicoIdRaw === undefined || invFisicoIdRaw === '') {
      return this.invFisicoRepo.findFlattenedLineas(undefined, fecha);
    }
    const id = Number.parseInt(invFisicoIdRaw, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestException('invFisicoId debe ser numérico');
    }
    return this.invFisicoRepo.findFlattenedLineas(id, fecha);
  }

  @Get()
  @ApiOperation({ summary: 'Rutas del módulo InvFisico' })
  routesInfo() {
    return {
      encabezados: 'GET /InvFisico/encabezados',
      lineas: 'GET /InvFisico/lineas?invFisicoId= (opcional)',
      batch: 'POST /InvFisico/batch',
    };
  }
}
