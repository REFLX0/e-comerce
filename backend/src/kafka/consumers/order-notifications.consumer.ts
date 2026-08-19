import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { OrderCreatedEvent } from '../events';

@Injectable()
export class OrderNotificationsConsumer implements OnModuleInit {
  private readonly logger = new Logger(OrderNotificationsConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly notifications: NotificationsService,
  ) {}

  async onModuleInit() {
    await this.kafkaService.createConsumer(
      'order-notifications-group',
      ['order.created'],
      async (payload: OrderCreatedEvent) => {
        this.logger.log(`Processing order.created for order ${payload.orderId}`);
        
        // 1. Create DB Notification for Admins
        try {
          await this.notifications.create({
            type: 'new_order',
            title: `Nouvelle commande #${payload.orderId.slice(-8).toUpperCase()}`,
            message: `${payload.totalAmount.toFixed(2)} TND — ${payload.customerName}`,
            link: `/admin/orders`,
          });
        } catch (err) {
          this.logger.error(`Failed to create notification: ${(err as Error).message}`);
        }

        // 2. Send email via Resend (would go here)
        // e.g. await this.emailService.sendOrderConfirmation(payload.orderId);
      },
    );
  }
}
