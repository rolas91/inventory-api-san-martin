import {
  Body,
  Controller,
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
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { GetProductKilosUseCase } from '../../application/use-cases/get-product-kilos.use-case';
import { CreateProductUseCase, CreateProductKilosUseCase } from '../../application/use-cases/create-product.use-case';
import { ProductResponseDto, ProductKilosResponseDto } from '../../application/dtos/product-response.dto';
import { CreateProductDto, CreateProductKilosDto } from '../../application/dtos/create-product.dto';

@ApiTags('Planta')
@ApiBearerAuth()
@ApiSecurity('X-Server-Flag')
@UseGuards(JwtAuthGuard)
@Controller('Planta')
export class PlantaController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductKilosUseCase: GetProductKilosUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly createProductKilosUseCase: CreateProductKilosUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos de planta' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  getProducts(): Promise<ProductResponseDto[]> {
    return this.getProductsUseCase.execute();
  }

  @Get('all-producto-kilos')
  @ApiOperation({ summary: 'Obtener todos los productos con destino en kilos' })
  @ApiResponse({ status: 200, type: [ProductKilosResponseDto] })
  getProductKilos(): Promise<ProductKilosResponseDto[]> {
    return this.getProductKilosUseCase.execute();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear producto de planta' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  createProduct(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.createProductUseCase.execute(dto);
  }

  @Post('kilos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear registro de producto kilos' })
  @ApiResponse({ status: 201, type: ProductKilosResponseDto })
  createProductKilos(@Body() dto: CreateProductKilosDto): Promise<ProductKilosResponseDto> {
    return this.createProductKilosUseCase.execute(dto);
  }
}
