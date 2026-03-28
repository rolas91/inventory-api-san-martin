import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { GetProductKilosUseCase } from '../../application/use-cases/get-product-kilos.use-case';
import { CreateProductUseCase, CreateProductKilosUseCase } from '../../application/use-cases/create-product.use-case';
import { ImportProductsCsvUseCase } from '../../application/use-cases/import-products-csv.use-case';
import { ProductResponseDto, ProductKilosResponseDto } from '../../application/dtos/product-response.dto';
import { CreateProductDto, CreateProductKilosDto } from '../../application/dtos/create-product.dto';

@ApiTags('Planta')
@ApiBearerAuth()
@ApiSecurity('X-Server-Flag')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('Planta')
export class PlantaController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductKilosUseCase: GetProductKilosUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly createProductKilosUseCase: CreateProductKilosUseCase,
    private readonly importProductsCsvUseCase: ImportProductsCsvUseCase,
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

  /**
   * Importación masiva de productos desde CSV.
   *
   * El archivo debe tener encabezado con las columnas (en cualquier orden):
   *   codProduccion, nombProducto, numProducto
   *
   * Comportamiento por fila:
   *  - Si codProduccion NO existe → INSERT con isActive=true y fechas automáticas.
   *  - Si codProduccion YA existe y los datos cambiaron → UPDATE.
   *  - Si no hubo cambios → skipped.
   */
  @Post('import-products-csv')
  @Roles('admin', 'supervisor')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.match(/\.(csv|txt)$/i)) {
          return cb(new Error('Solo se aceptan archivos .csv o .txt'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo CSV con columnas: codProduccion, nombProducto, numProducto',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Importar productos desde CSV [admin, supervisor]',
    description:
      'Columnas requeridas: **codProduccion**, **nombProducto**, **numProducto**. ' +
      'Inserta nuevos, actualiza existentes si cambiaron, omite sin cambios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la importación',
    schema: {
      example: { total: 100, inserted: 80, updated: 15, skipped: 5, errors: [] },
    },
  })
  importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No se recibió ningún archivo');
    }
    return this.importProductsCsvUseCase.execute(file.buffer);
  }
}
