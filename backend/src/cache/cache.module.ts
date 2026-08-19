import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * Global CacheModule — imported once in AppModule.
 * CacheService is available everywhere without re-importing.
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
