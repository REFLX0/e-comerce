import { Controller, Get, Post, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query('q') q: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.fullSearch(
      q,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get('products')
  searchProducts(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.searchService.searchProducts(q, limit ? +limit : 5);
  }

  @Get('suggestions')
  suggestions(@Query('q') q: string) {
    return this.searchService.getSuggestionsWithFallback(q);
  }

  /**
   * POST /api/search/reindex
   * Admin-only: triggers a full bulk re-index from PostgreSQL → OpenSearch.
   * Requires header: x-admin-key matching the JWT_SECRET env var.
   *
   * Usage from VM:
   *   curl -X POST https://specpart.tech/api/search/reindex \
   *        -H "x-admin-key: <JWT_SECRET>"
   */
  @Post('reindex')
  async reindex(@Headers('x-admin-key') key: string) {
    if (!key || key !== process.env.JWT_SECRET) {
      throw new UnauthorizedException('Invalid admin key');
    }
    return this.searchService.bulkReindex();
  }
}
