import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../../../../common/auth/permissions';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { BodegasRepository } from '../repositories/bodegas.repository';
import { UbicacionResponseDto, CreateUbicacionDto, UpdateUbicacionDto } from '../../application/dtos/ubicacion.dto';

@ApiTags('Ubicaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('Ubicaciones')
export class UbicacionesController {
  constructor(private readonly repo: BodegasRepository) {}

  @Get(':bodegaId')
  @ApiOperation({ summary: 'Ubicaciones de una bodega' })
  @ApiResponse({ status: 200, type: [UbicacionResponseDto] })
  getByBodega(@Param('bodegaId', ParseIntPipe) bodegaId: number) {
    return this.repo.findUbicacionesByBodega(bodegaId, false);
  }

  @Post()
  @Permissions(PERMISSIONS.UBICACIONES_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear ubicación [admin]' })
  @ApiResponse({ status: 201, type: UbicacionResponseDto })
  create(@Body() dto: CreateUbicacionDto) {
    return this.repo.createUbicacion(dto);
  }

  @Put(':id')
  @Permissions(PERMISSIONS.UBICACIONES_UPDATE)
  @ApiOperation({ summary: 'Actualizar ubicación [admin]' })
  @ApiResponse({ status: 200, type: UbicacionResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUbicacionDto) {
    return this.repo.updateUbicacion(id, dto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.UBICACIONES_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete ubicación [admin]' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.repo.softDeleteUbicacion(id);
  }
}
