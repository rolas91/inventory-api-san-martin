import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { BodegasRepository } from '../repositories/bodegas.repository';
import { BodegaResponseDto } from '../../application/dtos/bodega.dto';
import { UbicacionResponseDto } from '../../application/dtos/ubicacion.dto';

@ApiTags('Catalogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('Catalogos')
export class CatalogosController {
  constructor(private readonly repo: BodegasRepository) {}

  @Get('bodegas')
  @ApiOperation({ summary: 'Catálogo de bodegas activas' })
  @ApiResponse({ status: 200, type: [BodegaResponseDto] })
  getBodegas(): Promise<BodegaResponseDto[]> {
    return this.repo.findAllBodegas(true) as Promise<BodegaResponseDto[]>;
  }

  @Get('ubicaciones')
  @ApiOperation({ summary: 'Catálogo de ubicaciones activas' })
  @ApiResponse({ status: 200, type: [UbicacionResponseDto] })
  getUbicaciones(): Promise<UbicacionResponseDto[]> {
    return this.repo.findAllUbicaciones(true) as Promise<UbicacionResponseDto[]>;
  }

  @Get('ubicaciones/:bodegaId')
  @ApiOperation({ summary: 'Ubicaciones activas de una bodega' })
  @ApiResponse({ status: 200, type: [UbicacionResponseDto] })
  getUbicacionesPorBodega(
    @Param('bodegaId', ParseIntPipe) bodegaId: number,
  ): Promise<UbicacionResponseDto[]> {
    return this.repo.findUbicacionesByBodega(bodegaId, true) as Promise<UbicacionResponseDto[]>;
  }
}
