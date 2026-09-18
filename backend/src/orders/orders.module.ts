import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { NotificationsService } from '../notifications/notifications.service';
import { CouponsModule } from '../coupons/coupons.module';
import { ShippingModule } from '../shipping/shipping.module';

@Module({
  imports: [CouponsModule, ShippingModule],
  controllers: [OrdersController],
  providers: [OrdersService, NotificationsService],
  // AdminModule reuses releaseOrderReservations() when an order is cancelled
  // or returned from the back office.
  exports: [OrdersService],
})
export class OrdersModule {}
