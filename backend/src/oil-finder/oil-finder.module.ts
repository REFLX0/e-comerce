import { Module } from '@nestjs/common';
import { OilFinderService } from './oil-finder.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OilFinderController } from './oil-finder.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [PrismaModule, ProductsModule],
  controllers: [OilFinderController],
  providers: [OilFinderService],
  exports: [OilFinderService],
})
export class OilFinderModule {}
