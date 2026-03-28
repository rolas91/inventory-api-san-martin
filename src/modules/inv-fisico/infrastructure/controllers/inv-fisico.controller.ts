import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseArrayPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { BatchInvFisicoUseCase } from '../../application/use-cases/batch-inv-fisico.use-case';
import { DeleteAllInvFisicoUseCase } from '../../application/use-cases/delete-all-inv-fisico.use-case';
import { InvFisicoItemDto } from '../../application/dtos/inv-fisico-batch.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../auth/domain/interfaces/jwt-payload.interface';

@ApiTags('InvFisico')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('InvFisico')
export class InvFisicoController {
  constructor(
    private readonly batchUseCase: BatchInvFisicoUseCase,
    private readonly deleteAllUseCase: DeleteAllInvFisicoUseCase,
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

  @Get()
  @ApiOperation({ summary: 'Health-check del módulo InvFisico' })
  getAll() {
    return { message: 'Use POST /InvFisico/batch to submit records' };
  }
}
