import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SearchQueryDto } from './dto/search-query.dto';
import { SuggestionsQueryDto } from './dto/suggestions-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() query: SearchQueryDto) {
    return this.searchService.fullSearch(query.q, query.page, query.limit);
  }

  @Get('products')
  searchProducts(@Query() query: SearchQueryDto) {
    return this.searchService.searchProducts(query.q, query.limit);
  }

  @Get('suggestions')
  suggestions(@Query() query: SuggestionsQueryDto) {
    return this.searchService.getSuggestionsWithFallback(query.q);
  }

  /**
   * POST /api/search/reindex
   * Full bulk re-index from PostgreSQL to OpenSearch.
   *
   * Previously gated on an `x-admin-key` header compared against JWT_SECRET:
   * that put the token-signing secret in curl invocations and shell history,
   * where leaking it meant an attacker could mint admin tokens. It now uses the
   * same admin session as the rest of the back office.
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('reindex')
  async reindex() {
    return this.searchService.bulkReindex();
  }
}
