import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { KafkaModule } from './kafka/kafka.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { SearchModule } from './search/search.module';
import { UploadsModule } from './uploads/uploads.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { CouponsModule } from './coupons/coupons.module';
import { TicketsModule } from './tickets/tickets.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { ShippingModule } from './shipping/shipping.module';
import { ChatModule } from './chat/chat.module';
import { OilFinderModule } from './oil-finder/oil-finder.module';
import { MailModule } from './mail/mail.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    CacheModule,  // ← Global Redis cache
    KafkaModule,  // ← Global Kafka Message Broker
    MailModule,   // ← Global Transactional Mail Service
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    OrdersModule,
    ReviewsModule,
    VehiclesModule,
    SearchModule,
    UploadsModule,
    AdminModule,
    HealthModule,
    CouponsModule,
    TicketsModule,
    WishlistModule,
    NotificationsModule,
    SettingsModule,
    ShippingModule,
    ChatModule,
    OilFinderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
