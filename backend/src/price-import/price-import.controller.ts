import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PriceImportService } from './price-import.service';
import { ApplyPriceImportDto } from './dto/apply-price-import.dto';
import { isSpreadsheetFile } from './parsers/spreadsheet-price-parser.util';

const ACCEPTED_TYPE_ERROR =
  'Only PDF, CSV or XLSX files are accepted.';

@ApiTags('admin-price-imports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/price-imports')
export class PriceImportController {
  constructor(private readonly priceImportService: PriceImportService) {}

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
      fileFilter: (_req, file, cb) => {
        const isPdf = file.mimetype === 'application/pdf';
        if (!isPdf && !isSpreadsheetFile(file.originalname, file.mimetype)) {
          return cb(new BadRequestException(ACCEPTED_TYPE_ERROR), false);
        }
        cb(null, true);
      },
    }),
  )
  createPreview(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) throw new BadRequestException('No PDF file received.');
    return this.priceImportService.createPreview(file, userId);
  }

  @Post(':id/apply')
  @HttpCode(HttpStatus.OK)
  applyImport(
    @Param('id') id: string,
    @Body() dto: ApplyPriceImportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.priceImportService.applyImport(id, dto.itemIds, userId);
  }

  @Post(':id/rollback')
  @HttpCode(HttpStatus.OK)
  rollbackImport(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.priceImportService.rollbackImport(id, userId);
  }

  @Get()
  findHistory(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.priceImportService.findHistory(
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.priceImportService.findOne(id);
  }
}
