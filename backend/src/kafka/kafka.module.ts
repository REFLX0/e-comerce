import { Global, Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { OrderNotificationsConsumer } from './consumers/order-notifications.consumer';
import { ProductCacheConsumer } from './consumers/product-cache.consumer';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProductsModule } from '../products/products.module';

@Global()
@Module({
  imports: [NotificationsModule, ProductsModule],
  providers: [KafkaService, OrderNotificationsConsumer, ProductCacheConsumer],
  exports: [KafkaService],
})
export class KafkaModule {}
