import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SearchService } from './search.service'

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') q: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.searchService.fullSearch(q, page ? +page : 1, limit ? +limit : 20)
  }

  @Get('products')
  searchProducts(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.searchService.searchProducts(q, limit ? +limit : 5)
  }

  @Get('suggestions')
  suggestions(@Query('q') q: string) {
    return this.searchService.getSuggestions(q)
  }
}
