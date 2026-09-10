import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsModule } from '../uploads/uploads.module';
import { PriceImportService } from './price-import.service';
import { PriceImportController } from './price-import.controller';
import { ParserRegistry } from './parsers/parser-registry';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() }), UploadsModule],
  controllers: [PriceImportController],
  providers: [PriceImportService, ParserRegistry],
  exports: [PriceImportService],
})
export class PriceImportModule {}
