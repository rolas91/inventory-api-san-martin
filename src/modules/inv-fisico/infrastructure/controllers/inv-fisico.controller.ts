import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { BatchInvFisicoUseCase } from '../../application/use-cases/batch-inv-fisico.use-case';
import { DeleteAllInvFisicoUseCase } from '../../application/use-cases/delete-all-inv-fisico.use-case';
import { InvFisicoBatchDto } from '../../application/dtos/inv-fisico-batch.dto';
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

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar batch de inventario físico',
    description: 'Recibe un array de registros de inventario y los persiste en la base de datos.',
  })
  @ApiResponse({ status: 200, description: 'Batch procesado exitosamente' })
  @ApiResponse({ status: 201, description: 'Batch creado' })
  async batch(
    @Body() dto: InvFisicoBatchDto,
    @CurrentUser() _user: JwtPayload,
  ): Promise<{ success: boolean; count: number }> {
    return this.batchUseCase.execute(dto.items);
  }

  @Delete('delete-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar todos los registros de inventario físico' })
  @ApiResponse({ status: 204, description: 'Eliminados correctamente' })
  @ApiResponse({ status: 200, description: 'Eliminados correctamente' })
  async deleteAll(): Promise<void> {
    await this.deleteAllUseCase.execute();
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los registros de inventario físico' })
  getAll() {
    return { message: 'Use /InvFisico/batch to submit records' };
  }
}
