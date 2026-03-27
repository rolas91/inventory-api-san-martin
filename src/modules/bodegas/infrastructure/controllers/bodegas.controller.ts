import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, ParseIntPipe, Post, Put, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { BodegasRepository } from '../repositories/bodegas.repository';
import { BodegaResponseDto, CreateBodegaDto, UpdateBodegaDto } from '../../application/dtos/bodega.dto';

@ApiTags('Bodegas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('Bodegas')
export class BodegasController {
  constructor(private readonly repo: BodegasRepository) {}

  @Get()
  @ApiOperation({ summary: 'Todas las bodegas (activas e inactivas)' })
  @ApiResponse({ status: 200, type: [BodegaResponseDto] })
  getAll() {
    return this.repo.findAllBodegas(false);
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear bodega [admin]' })
  @ApiResponse({ status: 201, type: BodegaResponseDto })
  create(@Body() dto: CreateBodegaDto) {
    return this.repo.createBodega(dto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar bodega [admin]' })
  @ApiResponse({ status: 200, type: BodegaResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBodegaDto) {
    return this.repo.updateBodega(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete bodega [admin]' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.repo.softDeleteBodega(id);
  }
}
