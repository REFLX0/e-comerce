import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MailModule } from '../mail/mail.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  // OrdersModule provides OrdersService, whose releaseOrderReservations() puts
  // stock back when an order is cancelled or returned from the admin UI.
  imports: [MailModule, OrdersModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
