import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import { ProductsService } from '../../products/products.service';
import { ProductUpdatedEvent } from '../events';

@Injectable()
export class ProductCacheConsumer implements OnModuleInit {
  private readonly logger = new Logger(ProductCacheConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly productsService: ProductsService,
  ) {}

  async onModuleInit() {
    await this.kafkaService.createConsumer(
      'product-cache-group',
      ['product.updated'],
      async (payload: ProductUpdatedEvent) => {
        this.logger.log(`Processing product.updated for ${payload.slug}`);
        
        try {
          await this.productsService.invalidateProduct(payload.slug);
        } catch (err) {
          this.logger.error(`Failed to invalidate cache for ${payload.slug}: ${(err as Error).message}`);
        }
      },
    );
  }
}
